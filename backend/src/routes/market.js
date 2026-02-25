import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

// GET /api/market/moment — current market moment (public)
router.get('/moment', async (req, res) => {
  const { data, error } = await supabase
    .from('market_moment')
    .select('*')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/market/config — aporte percentage config (public)
router.get('/config', async (req, res) => {
  const { data, error } = await supabase
    .from('aporte_config')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
