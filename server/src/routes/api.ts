import express from 'express'

import scrapeRoutes from './scrape'

const router = express.Router()

router.use('/scrape', scrapeRoutes)

router.get('/hello', (_, res) => {
  res.json({ message: 'Hello from API' })
})

router.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

export default router
