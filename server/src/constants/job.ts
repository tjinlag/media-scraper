export const JOB_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS]

export const MEDIA_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video',
  ALL: 'all'
} as const

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE]

export const SCRAPE_BATCH_STATUS = {
  PENDING: 'pending',
  DONE: 'done',
  FAILED: 'failed'
} as const

export type BatchStatus = (typeof SCRAPE_BATCH_STATUS)[keyof typeof SCRAPE_BATCH_STATUS]
