import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query

  // Get the match
  const { data: match, error: matchErr } = await supabaseAdmin
    .from('request_matches')
    .select('*, requests(client_id)')
    .eq('id', id)
    .single()

  if (matchErr || !match) return res.status(404).json({ error: 'Match not found' })
  if (match.independent_profile_id !== user.id) return res.status(403).json({ error: 'Forbidden' })
  if (match.status !== 'pending') return res.status(400).json({ error: 'Match already processed' })

  // Check if a mission already exists for this request + independent
  const { data: existingMission } = await supabaseAdmin
    .from('missions')
    .select('id')
    .eq('request_id', match.request_id)
    .eq('independent_id', user.id)
    .single()

  if (existingMission) {
    return res.status(400).json({ error: 'Mission already exists for this match' })
  }

  // Update match status
  await supabaseAdmin
    .from('request_matches')
    .update({ status: 'accepted' })
    .eq('id', id)

  // Create the mission
  const { data: mission, error: misErr } = await supabaseAdmin
    .from('missions')
    .insert({
      request_id: match.request_id,
      independent_id: user.id,
      client_id: match.requests.client_id,
      status: 'ongoing',
      paid: false,
    })
    .select()
    .single()

  if (misErr) return res.status(500).json({ error: misErr.message })

  // Update request status to matched
  await supabaseAdmin
    .from('requests')
    .update({ status: 'matched' })
    .eq('id', match.request_id)

  // Decline all other pending matches for this request
  await supabaseAdmin
    .from('request_matches')
    .update({ status: 'declined' })
    .eq('request_id', match.request_id)
    .eq('status', 'pending')
    .neq('id', id)

  return res.status(200).json({ mission })
}
