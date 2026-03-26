import { logger } from '@/logger'
import { runMigrations } from './migrate'
import { createJob, saveMediaItems, getMedia, createBatch, getAllBatches } from '@/db/queries'

runMigrations()

const batchId = createBatch(3)
logger.info('Created batch with id:', batchId)

const jobId = createJob(batchId, 'https://example.com')
logger.info('Created job with id:', jobId)

saveMediaItems(jobId, batchId, ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'], 'image')

saveMediaItems(jobId, batchId, ['https://example.com/video1.mp4'], 'video')

const result = getMedia({ type: 'image', search: '', page: 1, limit: 10 })
logger.info('Media items:', result)

const allBatches = getAllBatches()
logger.info('All batches:', allBatches)
