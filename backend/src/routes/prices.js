import { Router } from 'express'

const router = Router()

// GET /api/prices/btc — BTC price in USD via CoinGecko
router.get('/btc', async (req, res) => {
  try {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`)
    const data = await response.json()
    res.json({ usd: data.bitcoin.usd })
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
})

// GET /api/prices/brl — BRL/USD rate via AwesomeAPI
router.get('/brl', async (req, res) => {
  try {
    const url = 'https://economia.awesomeapi.com.br/json/last/USD-BRL'
    const response = await fetch(url)
    if (!response.ok) throw new Error(`AwesomeAPI error: ${response.status}`)
    const data = await response.json()
    res.json({ brl: parseFloat(data.USDBRL.bid) })
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
})

export default router
