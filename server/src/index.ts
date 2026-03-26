import cors from 'cors'
import express from 'express'

import { DEFAULT_APP_PORT } from '@/constants/config'
import apiRoutes from '@/routes/api'
import { logger } from '@/logger'
import { runMigrations } from '@/db/migrate'

const app = express()
const PORT = process.env.PORT || DEFAULT_APP_PORT

app.use(cors())
app.use(express.json())

runMigrations()

app.use('/api', apiRoutes)

app.get('/', (_, res) => {
  res.send('Welcome to the Media Scraper Server!')
})

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
})
