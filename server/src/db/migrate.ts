import { logger } from '@/logger'
import db from './database'

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scrape_batches (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      redis_id   INTEGER UNIQUE,
      status     TEXT DEFAULT 'pending',
      total_urls INTEGER DEFAULT 0,
      done_count INTEGER DEFAULT 0,
      fail_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS scrape_jobs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id   INTEGER NOT NULL REFERENCES scrape_batches(id),
      url        TEXT NOT NULL,
      status     TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS media_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id     INTEGER NOT NULL REFERENCES scrape_jobs(id),
      batch_id   INTEGER NOT NULL REFERENCES scrape_batches(id),
      media_url  TEXT NOT NULL,
      type       TEXT NOT NULL CHECK(type IN ('image', 'video')),
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_media_type     ON media_items(type);
    CREATE INDEX IF NOT EXISTS idx_media_url      ON media_items(media_url);
    CREATE INDEX IF NOT EXISTS idx_media_batch    ON media_items(batch_id);
    CREATE INDEX IF NOT EXISTS idx_job_batch      ON scrape_jobs(batch_id);
  `)

  logger.info('Database migrations complete')
}
