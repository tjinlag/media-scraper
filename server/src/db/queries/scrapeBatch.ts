import db from '@/db/database'

export function createBatch(totalUrls: number) {
  const result = db
    .prepare(
      `
      INSERT INTO scrape_batches (total_urls, status)
      VALUES (?, 'pending')
    `
    )
    .run(totalUrls)
  return result.lastInsertRowid as number
}

export function updateBatchProgress(batchId: number) {
  db.prepare(
    `
    UPDATE scrape_batches
    SET
      done_count = (SELECT COUNT(*) FROM scrape_jobs WHERE batch_id = ? AND status = 'completed'),
      fail_count = (SELECT COUNT(*) FROM scrape_jobs WHERE batch_id = ? AND status = 'failed'),
      status = CASE
        WHEN (SELECT COUNT(*) FROM scrape_jobs WHERE batch_id = ? AND status = 'pending') = 0
        THEN 'completed'
        ELSE 'pending'
      END
    WHERE id = ?
  `
  ).run(batchId, batchId, batchId, batchId)
}

export function getBatch(batchId: number) {
  return db
    .prepare(
      `
      SELECT * FROM scrape_batches WHERE id = ?
    `
    )
    .get(batchId)
}

export function getAllBatches(offset = 0, limit = 20) {
  return db
    .prepare(
      `
      SELECT * FROM scrape_batches ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `
    )
    .all(limit, offset)
}

export function ensureDbRecords(tempBatchId: number, url: string) {
  const batch = db
    .prepare(
      `
    INSERT OR IGNORE INTO scrape_batches (redis_id, total_urls, status)
    VALUES (?, 1, 'pending')
  `
    )
    .run(tempBatchId)

  const job = db
    .prepare(
      `
    INSERT OR IGNORE INTO scrape_jobs (batch_id, url, status)
    VALUES (?, ?, 'pending')
  `
    )
    .run(batch.lastInsertRowid, url)

  return {
    batchId: batch.lastInsertRowid as number,
    jobId: job.lastInsertRowid as number
  }
}

export function findOrCreateScrapeBatch(redisId: number, totalUrls: number): number {
  const existing = db
    .prepare(
      `
    SELECT id FROM scrape_batches WHERE redis_id = ?
  `
    )
    .get(redisId) as { id: number } | undefined

  if (existing) return existing.id

  const result = db
    .prepare(
      `
    INSERT INTO scrape_batches (redis_id, total_urls, status)
    VALUES (?, ?, 'pending')
  `
    )
    .run(redisId, totalUrls)

  return result.lastInsertRowid as number
}

export function getBatchByRedisId(redisId: number) {
  return db
    .prepare(
      `
    SELECT * FROM scrape_batches WHERE redis_id = ?
  `
    )
    .get(redisId)
}
