import { Queue } from 'bullmq'
import dotenv from 'dotenv'
import IORedis, { RedisOptions } from 'ioredis'

dotenv.config()

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  connectTimeout: 10_000,
  commandTimeout: 10_000,
  retryStrategy: (times) => {
    if (times > 3) return null
    return Math.min(times * 500, 2_000)
  },
  keepAlive: 3_000,
  enableReadyCheck: false
}

export const connection = new IORedis({
  ...redisConfig,
  connectionName: 'app-main'
})

const queueConnection = new IORedis({
  ...redisConfig,
  connectionName: 'bullmq-queue'
})

export const workerConnection = new IORedis({
  ...redisConfig,
  connectionName: 'bullmq-worker'
})

export const scrapeQueue = new Queue('scrape', {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2_000 },
    removeOnComplete: 500,
    removeOnFail: 100
  }
})
