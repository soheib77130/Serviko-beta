import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('client')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }
    // create profile record using anon key (client-side)
    const profile = {
      auth_uid: data.user?.id || null,
      full_name: fullName,
      role,
      skills: [],
      categories: [],
      online: false
    }
    await supabase.from('profiles').insert(profile)
    setLoading(false)
    alert('Inscription réussie — vérifie tes emails si confirmation requise. Tu peux te connecter.')
    router.push('/login')
  }

  return (
    <main style={{padding:40,fontFamily:'Arial, sans-serif'}}>
      <h1>Inscription</h1>
      <form onSubmit={handleSignup} style={{display:'grid',gap:12,maxWidth:420}}>
        <input placeholder="Nom complet" value={fullName} onChange={e=>setFullName(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <input placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <label>
          <input type="radio" checked={role==='client'} onChange={()=>setRole('client')} /> Client
        </label>
        <label>
          <input type="radio" checked={role==='independent'} onChange={()=>setRole('independent')} /> Indépendant
        </label>
        <button type="submit" disabled={loading}>{loading? 'Patiente...' : 'S’inscrire'}</button>
      </form>
    </main>
  )
}
