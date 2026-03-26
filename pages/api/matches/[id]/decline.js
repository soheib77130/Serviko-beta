import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query

  const { data: match } = await supabaseAdmin
    .from('request_matches')
    .select('independent_profile_id')
    .eq('id', id)
    .single()

  if (!match) return res.status(404).json({ error: 'Match not found' })
  if (match.independent_profile_id !== user.id) return res.status(403).json({ error: 'Forbidden' })

  await supabaseAdmin
    .from('request_matches')
    .update({ status: 'declined' })
    .eq('id', id)

  return res.status(200).json({ success: true })
}
