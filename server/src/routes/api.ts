import express from 'express'

const router = express.Router()

router.get('/hello', (_, res) => {
  res.json({ message: 'Hello from API' })
})

router.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

export default router
