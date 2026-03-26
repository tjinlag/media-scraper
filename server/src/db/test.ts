import { runMigrations } from './migrate'
import { createJob, saveMediaItems, getMedia } from './queries'

runMigrations()

const jobId = createJob('https://example.com')
console.log('Created job with id:', jobId)

saveMediaItems(jobId, ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'], 'image')

saveMediaItems(jobId, ['https://example.com/video1.mp4'], 'video')

const result = getMedia({ type: 'image', search: '', page: 1, limit: 10 })
console.log('Media items:', result)
