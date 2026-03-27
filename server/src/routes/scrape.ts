import { Router } from 'express'

import { getAllBatches, getBatch, getBatchByRedisId, getJobsByBatchId, getMediaByBatch } from '@/db/queries'
import { logger } from '@/logger'
import { MediaType } from '@/constants/job'
import { connection, scrapeQueue } from '@/queue'

const router = Router()

router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const batches = getAllBatches(Number(page), Number(limit))
    logger.info('All batches:', batches)

    return res.json({ message: 'ok', data: batches, error: null })
  } catch (err) {
    logger.error('Failed to get batches', err)
    return res.status(500).json({ error: 'Failed to get all batches', data: null })
  }
})

router.get('/:scrapeBatchId', async (req, res) => {
  try {
    const { scrapeBatchId } = req.params

    // Read from Redis first
    const raw = await connection.get(`batch:${scrapeBatchId}:meta`)
    if (raw) {
      return res.json({
        data: {
          ...JSON.parse(raw)
        },
        error: null
      })
    }

    const batch = getBatch(Number(scrapeBatchId))
    if (!batch) {
      return res.status(404).json({ error: 'Scrape Batch not found', data: null })
    }

    return res.json({ data: batch, error: null })
  } catch (err) {
    logger.error('Failed to get scrape batch', err)
    return res.status(500).json({ error: 'Failed to get batch', data: null })
  }
})

router.get('/:scrapeBatchId/jobs', (req, res) => {
  try {
    const { scrapeBatchId } = req.params
    const { offset = 0, limit = 20 } = req.query
    const jobs = getJobsByBatchId(Number(scrapeBatchId), Number(offset), Number(limit))

    return res.json({ message: 'ok', data: jobs, error: null })
  } catch (err) {
    logger.error('Failed to get scrape jobs', err)
    return res.status(500).json({ error: 'Internal server error', data: null })
  }
})

router.get('/:scrapeBatchId/media', (req, res) => {
  try {
    const { scrapeBatchId } = req.params

    const batch = getBatchByRedisId(Number(scrapeBatchId)) as { id: number } | undefined
    if (!batch) {
      return res.json({ data: { items: [], total: 0 }, error: null })
    }

    const mediaItems = getMediaByBatch(batch.id, {
      offset: Number(req.query.offset) || 0,
      limit: Number(req.query.limit) || 20,
      type: req.query.type as MediaType,
      search: req.query.search as string
    })

    return res.json({ data: mediaItems, error: null })
  } catch (err) {
    logger.error('Failed to get media items', err)
    return res.status(500).json({ error: 'Internal Server Error', data: null })
  }
})

router.post('/', async (req, res) => {
  try {
    const { urls } = req.body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs is required', data: null })
    }

    const redisBatchId = await connection.incr('batch:id:counter')

    await scrapeQueue.addBulk(
      urls.map((url: string) => ({
        name: 'scrape-url',
        data: {
          redisBatchId,
          url,
          totalUrls: urls.length,
          createdAt: new Date().toISOString()
        }
      }))
    )

    res.json({
      data: {
        scrapeBatchId: redisBatchId,
        totalUrls: urls.length,
        urls
      },
      error: null
    })
  } catch (err) {
    logger.error('Failed to scrape URLs', err)
    return res.status(500).json({ error: 'Internal server error', data: null })
  }
})

export default router
