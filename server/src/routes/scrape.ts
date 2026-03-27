import { Router } from 'express'

import { createBatchWithJobs, getAllBatches, getBatch, getJobsByBatchId, getMediaByBatch } from '@/db/queries'
import { logger } from '@/logger'
import { MediaType } from '@/constants/job'
import { scrapeQueue } from '@/queue'

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

router.get('/:scrapeBatchId', (req, res) => {
  try {
    const { scrapeBatchId } = req.params
    const batch = getBatch(Number(scrapeBatchId))

    if (!batch) {
      return res.status(404).json({ error: 'Scrape Batch not found', data: null })
    }

    return res.json({ message: 'ok', data: batch, error: null })
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
    const mediaItems = getMediaByBatch(Number(scrapeBatchId), {
      offset: Number(req.query.offset) || 0,
      limit: Number(req.query.limit) || 20,
      type: req.query.type as MediaType,
      search: req.query.search as string
    })

    return res.json({ message: 'ok', data: mediaItems, error: null })
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

    const { batchId, jobs } = createBatchWithJobs(urls)

    await scrapeQueue.addBulk(
      jobs.map(({ jobId, url }) => ({
        name: 'scrape-url',
        data: { jobId, batchId, url }
      }))
    )

    res.json({
      data: {
        scrapeBatchId: batchId,
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
