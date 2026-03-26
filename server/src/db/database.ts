import Database from 'better-sqlite3'
import * as dotenv from 'dotenv'

import { DEFAULT_DATABASE_PATH } from '@/constants/config'

dotenv.config()

const db = new Database(process.env.DATABASE_PATH || DEFAULT_DATABASE_PATH)

export default db
