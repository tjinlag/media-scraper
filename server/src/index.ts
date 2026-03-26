import cors from 'cors'
import express from 'express'

import { DEFAULT_APP_PORT } from '@/constants/config'
import apiRoutes from '@/routes/api'

const app = express()
const PORT = process.env.PORT || DEFAULT_APP_PORT

app.use(cors())
app.use(express.json())

app.use('/api', apiRoutes)

app.get('/', (_, res) => {
  res.send('Welcome to the Media Scraper Server!')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
