/* global __ENV */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('error_rate')
const queueLatency = new Trend('queue_latency')

export const options = {
  stages: [
    { duration: '30s', target: 500 },
    { duration: '60s', target: 2000 },
    { duration: '60s', target: 4000 },
    { duration: '60s', target: 5000 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95) < 1000'],
    http_req_failed: ['rate < 0.02'],
    error_rate: ['rate < 0.02']
  },
  summaryTrendStats: ['avg', 'p(95)', 'p(99)', 'min', 'max']
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'

export default function () {
  const start = Date.now()

  const res = http.post(
    `${BASE_URL}/api/scrape`,
    JSON.stringify({
      urls: ['https://picsum.photos/']
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: '10s'
    }
  )

  const duration = Date.now() - start
  queueLatency.add(duration)

  const ok = check(res, {
    'status is 200': (response) => response.status === 200,
    'has batchId': (response) => JSON.parse(response.body)?.data?.scrapeBatchId !== undefined,
    'response under 2000ms': (response) => response.timings.duration < 2_000
  })

  errorRate.add(!ok)

  sleep(0.5)
}

export function handleSummary(data) {
  const reqs = data.metrics.http_reqs?.values?.count ?? 0
  const failed = data.metrics.http_req_failed?.values?.passes ?? 0
  const avg = data.metrics.http_req_duration?.values?.avg ?? 0
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'] ?? 0
  const p99 = data.metrics.http_req_duration?.values?.['p(99)'] ?? 0
  const errRate = data.metrics.error_rate?.values?.rate ?? 0

  return {
    './result.json': JSON.stringify(data, null, 2),
    stdout: `
      === Load Test Summary ===
      Total requests  : ${reqs}
      Failed requests : ${failed}
      Avg latency     : ${avg.toFixed(2)}ms
      p95 latency     : ${p95.toFixed(2)}ms
      p99 latency     : ${p99.toFixed(2)}ms
      Error rate      : ${(errRate * 100).toFixed(2)}%
      ========================
    `
  }
}
