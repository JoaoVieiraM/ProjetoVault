import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/settings — get authenticated user's settings
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', req.user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
    return res.status(500).json({ error: error.message })
  }

  // Return defaults if no settings exist yet
  res.json(data ?? {
    user_id: req.user.id,
    btc_public_key: null,
    currency: 'BRL',
    plan_frequency: 'mensal',
    plan_day: 'Segunda',
    plan_amount: 100,
  })
})

// PUT /api/settings — upsert authenticated user's settings
router.put('/', requireAuth, async (req, res) => {
  const allowed = ['btc_public_key', 'currency', 'plan_frequency', 'plan_day', 'plan_amount']
  const updates = {}
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key]
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: req.user.id, ...updates }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
