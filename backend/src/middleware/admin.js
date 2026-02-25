import { supabase } from '../lib/supabase.js'

// Must be used after requireAuth
export async function requireAdmin(req, res, next) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single()

  if (error || profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}
