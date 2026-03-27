import { Worker, Queue } from 'bullmq'
import axios from 'axios'
import * as cheerio from 'cheerio'
import dotenv from 'dotenv'
import https from 'https'

import { connection } from '@/queue'
import {
  saveMediaItems,
  updateJobStatus,
  updateBatchProgress,
  ensureDbRecords,
  findOrCreateScrapeBatch,
  createJob
} from '@/db/queries'
import { logger } from '@/logger'
import { getAbsoluteUrl } from '@/utils'
import { JOB_STATUS, MEDIA_TYPE } from '@/constants/job'

dotenv.config()

const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '50')

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

async function updateRedisBatchProgress(redisBatchId: number, result: 'completed' | 'failed') {
  const metaKey = `batch:${redisBatchId}:meta`
  const raw = await connection.get(metaKey)
  if (!raw) return

  const meta = JSON.parse(raw)

  if (result === 'completed') meta.done_count += 1
  if (result === 'failed') meta.fail_count += 1

  if (meta.done_count + meta.fail_count >= meta.total_urls) {
    meta.status = 'completed'
  }

  await connection.setex(metaKey, 86_400, JSON.stringify(meta))
}

async function start() {
  const cleanupQueue = new Queue('scrape', { connection })
  await cleanupQueue.obliterate({ force: true })
  logger.info('🧹 Queue cleared')

  const worker = new Worker(
    'scrape',
    async (job) => {
      const { redisBatchId, url, totalUrls } = job.data

      const batchId = findOrCreateScrapeBatch(redisBatchId, totalUrls)
      const jobId = createJob(batchId, url)

      try {
        const { data: html } = await axios.get(url, {
          timeout: 10_000,
          httpsAgent,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MediaScraper/1.0)' }
        })

        const $ = cheerio.load(html)
        const images = new Set<string>()
        $('img[src]').each((_, el) => {
          const src = $(el).attr('src')
          if (src) {
            const absoluteUrl = getAbsoluteUrl(src, url)
            if (!absoluteUrl.startsWith('data:')) {
              images.add(absoluteUrl)
            }
          }
        })

        const videos = new Set<string>()
        $('video[src], video source[src]').each((_, el) => {
          const src = $(el).attr('src')
          if (src) {
            const absoluteUrl = getAbsoluteUrl(src, url)
            if (!absoluteUrl.startsWith('data:')) {
              videos.add(absoluteUrl)
            }
          }
        })

        if (images.size) saveMediaItems(jobId, batchId, Array.from(images), MEDIA_TYPE.IMAGE)
        if (videos.size) saveMediaItems(jobId, batchId, Array.from(videos), MEDIA_TYPE.VIDEO)

        updateJobStatus(jobId, JOB_STATUS.COMPLETED)
        await updateRedisBatchProgress(redisBatchId, 'completed')
      } catch (err) {
        logger.error(`Failed to scrape URL ${url}`)
        updateJobStatus(jobId, JOB_STATUS.FAILED)
        await updateRedisBatchProgress(redisBatchId, 'failed')
        throw err
      } finally {
        updateBatchProgress(batchId)
      }
    },
    {
      connection,
      concurrency: CONCURRENCY,
      limiter: {
        max: 100,
        duration: 1_000
      }
    }
  )

  worker.on('error', (err) => logger.error('Worker error:', err.message))

  logger.info(`Worker started (concurrency: ${CONCURRENCY})`)
}

start()
