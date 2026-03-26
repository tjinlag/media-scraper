import { Router } from 'express'
import axios from 'axios'
import * as cheerio from 'cheerio'

import {
  createBatch,
  createJob,
  getAllBatches,
  getBatch,
  getMediaByBatch,
  saveMediaItems,
  updateJobStatus
} from '@/db/queries'
import { logger } from '@/logger'
import { JOB_STATUS, MEDIA_TYPE, MediaType } from '@/constants/job'
import { getAbsoluteUrl } from '@/utils'

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

    return res.json({ message: 'ok', data: batch, error: null })
  } catch (err) {
    logger.error('Failed to get scrape batch', err)
    return res.status(500).json({ error: 'Failed to get batch', data: null })
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

async function scrapeUrl(jobId: number, batchId: number, url: string) {
  try {
    logger.info(`Scraping URL ${url}, job ${jobId}, batch ${batchId}`)

    await updateJobStatus(jobId, JOB_STATUS.IN_PROGRESS)

    const { data: html } = await axios.get(url, {
      timeout: 10_000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MediaScraper/1.0)' }
    })

    const $ = cheerio.load(html)

    const images: string[] = []
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src')
      if (src) {
        const absoluteUrl = getAbsoluteUrl(src, url)
        if (!absoluteUrl.startsWith('data:')) {
          images.push(absoluteUrl)
        }
      }
    })

    const videos: string[] = []
    $('video[src], video source[src]').each((_, el) => {
      const src = $(el).attr('src')
      if (src) {
        const absoluteUrl = getAbsoluteUrl(src, url)
        if (!absoluteUrl.startsWith('data:')) {
          videos.push(absoluteUrl)
        }
      }
    })

    if (images.length) saveMediaItems(jobId, batchId, images, MEDIA_TYPE.IMAGE)
    if (videos.length) saveMediaItems(jobId, batchId, videos, MEDIA_TYPE.VIDEO)

    await updateJobStatus(jobId, JOB_STATUS.COMPLETED)
  } catch (err) {
    logger.error(`Failed to scrape URL ${url}`, err)
    await updateJobStatus(jobId, JOB_STATUS.FAILED)
  }
}

router.post('/', async (req, res) => {
  try {
    const { urls } = req.body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs is required', data: null })
    }

    const batchId = createBatch(urls.length)

    // TODO: create job in one transaction
    const jobs = urls.map((url: string) => ({
      jobId: createJob(batchId, url),
      url
    }))

    Promise.all(jobs.map(({ jobId, url }) => scrapeUrl(jobId, batchId, url)))

    res.json({
      message: 'ok',
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
