import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProfilePage(){
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      const user = supabase.auth.getUser().then(res=>res.data.user)
      const u = await user
      if (!u) { setLoading(false); return }
      const { data } = await supabase.from('profiles').select('*').eq('auth_uid', u.id).single()
      setProfile(data)
      setLoading(false)
    }
    load()
  },[])

  if (loading) return <div style={{padding:20}}>Chargement…</div>
  if (!profile) return <div style={{padding:20}}>Pas de profil trouvé — connecte‑toi.</div>

  return (
    <main style={{padding:40,fontFamily:'Arial, sans-serif'}}>
      <h1>Mon profil</h1>
      <div><strong>Nom :</strong> {profile.full_name}</div>
      <div><strong>Role :</strong> {profile.role}</div>
      <div><strong>En ligne :</strong> {profile.online ? 'oui' : 'non'}</div>
    </main>
  )
}
