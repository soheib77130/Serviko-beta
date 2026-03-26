import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query
  const { files } = req.body // [{ path, filename }]

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files provided' })
  }

  const { data: mission } = await supabaseAdmin
    .from('missions')
    .select('independent_id, status')
    .eq('id', id)
    .single()

  if (!mission) return res.status(404).json({ error: 'Mission not found' })
  if (mission.independent_id !== user.id) return res.status(403).json({ error: 'Only the freelancer can deliver' })
  if (mission.status === 'completed') return res.status(400).json({ error: 'Mission already completed' })

  // Insert file records
  const fileRecords = files.map(f => ({
    mission_id: id,
    path: f.path,
    filename: f.filename,
    uploaded_by: user.id,
  }))

  const { error: fileErr } = await supabaseAdmin.from('files').insert(fileRecords)
  if (fileErr) return res.status(500).json({ error: fileErr.message })

  // Update mission status to delivered
  await supabaseAdmin
    .from('missions')
    .update({ status: 'delivered' })
    .eq('id', id)

  return res.status(200).json({ success: true, filesDelivered: files.length })
}
