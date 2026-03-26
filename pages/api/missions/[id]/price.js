import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query
  const { price } = req.body

  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ error: 'Invalid price' })
  }

  const { data: mission } = await supabaseAdmin
    .from('missions')
    .select('independent_id, paid')
    .eq('id', id)
    .single()

  if (!mission) return res.status(404).json({ error: 'Mission not found' })
  if (mission.independent_id !== user.id) return res.status(403).json({ error: 'Only the freelancer can set the price' })
  if (mission.paid) return res.status(400).json({ error: 'Mission already paid' })

  await supabaseAdmin
    .from('missions')
    .update({ price: Number(price) })
    .eq('id', id)

  return res.status(200).json({ price: Number(price) })
}
