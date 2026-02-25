import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import pricesRouter from './routes/prices.js'
import balanceRouter from './routes/balance.js'
import marketRouter from './routes/market.js'
import settingsRouter from './routes/settings.js'
import adminRouter from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/prices', pricesRouter)
app.use('/api/balance', balanceRouter)
app.use('/api/market', marketRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/admin', adminRouter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
