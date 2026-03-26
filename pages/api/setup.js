import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const results = []

  // Create livrables storage bucket
  const { data: existing } = await supabaseAdmin.storage.getBucket('livrables')
  if (!existing) {
    const { error } = await supabaseAdmin.storage.createBucket('livrables', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    })
    if (error) {
      results.push({ task: 'bucket_livrables', status: 'error', message: error.message })
    } else {
      results.push({ task: 'bucket_livrables', status: 'created' })
    }
  } else {
    results.push({ task: 'bucket_livrables', status: 'already_exists' })
  }

  return res.status(200).json({ results })
}
