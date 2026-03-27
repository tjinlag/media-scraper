import db from '@/db/database'

export function createJob(batchId: number, url: string) {
  const stmt = db.prepare(`
    INSERT INTO scrape_jobs (batch_id, url, status) VALUES (?, ?, 'pending')
  `)

  const result = stmt.run(batchId, url)

  return result.lastInsertRowid as number
}

export function createBatchWithJobs(urls: string[]): {
  batchId: number
  jobs: { jobId: number; url: string }[]
} {
  const createBatchStmt = db.prepare(`
    INSERT INTO scrape_batches (total_urls, status)
    VALUES (?, 'pending')
  `)

  const createJobStmt = db.prepare(`
    INSERT INTO scrape_jobs (batch_id, url, status)
    VALUES (?, ?, 'pending')
  `)

  const run = db.transaction((urls: string[]) => {
    const batchResult = createBatchStmt.run(urls.length)
    const batchId = batchResult.lastInsertRowid as number

    const jobs = urls.map((url) => {
      const jobResult = createJobStmt.run(batchId, url)
      return {
        jobId: jobResult.lastInsertRowid as number,
        url
      }
    })

    return { batchId, jobs }
  })

  return run(urls)
}

export function updateJobStatus(jobId: number, status: string) {
  db.prepare(
    `
    UPDATE scrape_jobs SET status = ? WHERE id = ?
  `
  ).run(status, jobId)
}

export function getJobsByBatchId(batchId: number, offset = 0, limit = 20) {
  const stmt = db.prepare(`
    SELECT * FROM scrape_jobs WHERE batch_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `)

  return stmt.all(batchId, limit, offset)
}

export function saveMediaItems(jobId: number, batchId: number, urls: string[], type: string) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO media_items (job_id, batch_id, media_url, type)
    VALUES (?, ?, ?, ?)
  `)

  const insertMany = db.transaction((items) => {
    for (const url of items) {
      stmt.run(jobId, batchId, url, type)
    }
  })

  insertMany(urls)
}

export function getMedia({
  type = 'image',
  search = '',
  page = 1,
  limit = 20
}: {
  type: string
  search: string
  page: number
  limit: number
}) {
  const offset = (page - 1) * limit
  const conditions = []
  const params = []

  if (type && type !== 'all') {
    conditions.push('type = ?')
    params.push(type)
  }

  if (search) {
    conditions.push('media_url LIKE ?')
    params.push(`%${search}%`)
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

  const row = db
    .prepare(
      `
    SELECT COUNT(*) as count FROM media_items ${where}
  `
    )
    .get(...params) as { count: number } | undefined

  const total = row?.count ?? 0

  const items = db
    .prepare(
      `
    SELECT * FROM media_items ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `
    )
    .all(...params, limit, offset)

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit)
  }
}

export function getMediaByBatch(
  batchId: number,
  {
    type,
    search,
    offset = 0,
    limit = 20
  }: {
    type?: string
    search?: string
    offset?: number
    limit?: number
  }
) {
  const conditions = ['batch_id = ?']
  const params: (number | string)[] = [batchId]

  if (type && type !== 'all') {
    conditions.push('type = ?')
    params.push(type)
  }
  if (search) {
    conditions.push('media_url LIKE ?')
    params.push(`%${search}%`)
  }

  const where = 'WHERE ' + conditions.join(' AND ')

  const total =
    (
      db
        .prepare(
          `
            SELECT COUNT(*) as count FROM media_items ${where}
          `
        )
        .get(...params) as { count: number } | undefined
    )?.count ?? 0

  const items = db
    .prepare(
      `
      SELECT * FROM media_items ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `
    )
    .all(...params, limit, offset)

  return { items, total, offset, limit }
}
