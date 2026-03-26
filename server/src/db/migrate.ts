import { logger } from '@/logger'
import db from './database'

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scrape_jobs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      url        TEXT NOT NULL,
      status     TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS media_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id     INTEGER NOT NULL REFERENCES scrape_jobs(id),
      media_url  TEXT NOT NULL,
      type       TEXT NOT NULL CHECK(type IN ('image', 'video')),
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_media_type ON media_items(type);
    CREATE INDEX IF NOT EXISTS idx_media_url  ON media_items(media_url);
    CREATE INDEX IF NOT EXISTS idx_media_job  ON media_items(job_id);
  `)

  logger.info('Database migrations complete')
}
