import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = createClient(url, serviceRole)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { client_profile_id, title, description, category, budget_min, budget_max } = req.body
  try {
    // create request
    const { data: reqData, error: reqErr } = await supabaseAdmin
      .from('requests')
      .insert({ client_profile_id, title, description, category, budget_min, budget_max })
      .select()
      .single()
    if (reqErr) throw reqErr

    // find online independents matching category
    const { data: inds, error: indsErr } = await supabaseAdmin
      .from('profiles')
      .select('id,full_name,skills,categories')
      .eq('online', true)
      .contains('categories', [category])
    if (indsErr) throw indsErr

    // create request_matches entries for each independent
    const matches = inds.map(i=>({ request_id: reqData.id, independent_profile_id: i.id }))
    if (matches.length>0) {
      const { error: mErr } = await supabaseAdmin.from('request_matches').insert(matches)
      if (mErr) throw mErr
    }

    return res.status(200).json({ request: reqData, matched: inds.length })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || err })
  }
}
