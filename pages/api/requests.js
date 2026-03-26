import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'client') {
    return res.status(403).json({ error: 'Only clients can create requests' })
  }

  const { title, category, description, budget_min, budget_max, deadline, urgency, collaboration_mode } = req.body

  if (!title || !category) {
    return res.status(400).json({ error: 'title and category are required' })
  }

  // Create the request
  const { data: request, error: reqErr } = await supabaseAdmin
    .from('requests')
    .insert({
      client_id: profile.id,
      title,
      category,
      description,
      budget_min: budget_min || null,
      budget_max: budget_max || null,
      deadline: deadline || 'flexible',
      urgency: urgency || 'normal',
      collaboration_mode: collaboration_mode || 'chat',
      status: 'open',
    })
    .select()
    .single()

  if (reqErr) return res.status(500).json({ error: reqErr.message })

  // Find online independents with matching category
  const { data: indeps } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('role', 'independent')
    .eq('online', true)
    .contains('categories', [category])

  let matchCount = 0
  if (indeps && indeps.length > 0) {
    const matches = indeps.map(indep => ({
      request_id: request.id,
      independent_profile_id: indep.id,
      status: 'pending',
    }))
    const { error: matchErr } = await supabaseAdmin.from('request_matches').insert(matches)
    if (!matchErr) matchCount = indeps.length
  }

  return res.status(200).json({ request, matchCount })
}
