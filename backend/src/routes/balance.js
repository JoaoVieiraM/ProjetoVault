import { Router } from 'express'

const router = Router()

// GET /api/balance/:address — on-chain BTC balance via Blockstream
router.get('/:address', async (req, res) => {
  const { address } = req.params

  // Basic validation to avoid passing arbitrary strings to the external API
  if (!/^[a-zA-Z0-9]{26,111}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Bitcoin address format' })
  }

  try {
    const url = `https://blockstream.info/api/address/${address}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Blockstream error: ${response.status}`)
    const data = await response.json()

    const confirmed_satoshis =
      (data.chain_stats?.funded_txo_sum ?? 0) - (data.chain_stats?.spent_txo_sum ?? 0)

    res.json({ confirmed_satoshis, address })
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
})

export default router
