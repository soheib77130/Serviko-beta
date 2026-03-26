import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query

  const { data: mission } = await supabaseAdmin
    .from('missions')
    .select('client_id, status, request_id')
    .eq('id', id)
    .single()

  if (!mission) return res.status(404).json({ error: 'Mission not found' })
  if (mission.client_id !== user.id) return res.status(403).json({ error: 'Only the client can complete the mission' })
  if (mission.status === 'completed') return res.status(400).json({ error: 'Mission already completed' })

  await Promise.all([
    supabaseAdmin.from('missions').update({ status: 'completed' }).eq('id', id),
    supabaseAdmin.from('requests').update({ status: 'closed' }).eq('id', mission.request_id),
  ])

  return res.status(200).json({ success: true })
}
