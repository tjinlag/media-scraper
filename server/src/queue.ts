import { Queue } from 'bullmq'
import dotenv from 'dotenv'
import IORedis from 'ioredis'

dotenv.config()

export const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  connectTimeout: 10_000,
  commandTimeout: 10_000,
  retryStrategy: (times) => {
    if (times > 3) return null
    return Math.min(times * 500, 2_000)
  }
})

export const scrapeQueue = new Queue('scrape', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2_000 },
    removeOnComplete: 500,
    removeOnFail: 100
  }
})
