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
    .select('client_id, price, paid')
    .eq('id', id)
    .single()

  if (!mission) return res.status(404).json({ error: 'Mission not found' })
  if (mission.client_id !== user.id) return res.status(403).json({ error: 'Only the client can pay' })
  if (mission.paid) return res.status(400).json({ error: 'Mission already paid' })
  if (!mission.price) return res.status(400).json({ error: 'No price set for this mission' })

  const commission = mission.price * 0.02

  // Simulate payment (no real Stripe for now)
  await supabaseAdmin
    .from('missions')
    .update({ paid: true, commission })
    .eq('id', id)

  return res.status(200).json({
    success: true,
    paid: true,
    price: mission.price,
    commission,
    total: mission.price + commission,
    simulation: true,
  })
}
