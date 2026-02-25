import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = Router()

const VALID_STATUSES = ['ÓTIMO', 'BOM', 'OK', 'RUIM', 'PÉSSIMO']

// PUT /api/admin/moment — update market moment status
router.put('/moment', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  const { data, error } = await supabase
    .from('market_moment')
    .update({ status, updated_by: req.user.id, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PUT /api/admin/config — update aporte percentages for all moments
router.put('/config', requireAuth, requireAdmin, async (req, res) => {
  const { configs } = req.body

  if (!Array.isArray(configs) || configs.length !== 5) {
    return res.status(400).json({ error: 'configs must be an array with 5 entries' })
  }

  for (const item of configs) {
    if (!VALID_STATUSES.includes(item.moment_status)) {
      return res.status(400).json({ error: `Invalid moment_status: ${item.moment_status}` })
    }
    if (typeof item.percentage_increase !== 'number') {
      return res.status(400).json({ error: 'percentage_increase must be a number' })
    }
  }

  const { data, error } = await supabase
    .from('aporte_config')
    .upsert(configs, { onConflict: 'moment_status' })
    .select()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
