import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Login(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }
    setLoading(false)
    router.push('/')
  }

  return (
    <main style={{padding:40,fontFamily:'Arial, sans-serif'}}>
      <h1>Connexion</h1>
      <form onSubmit={handleLogin} style={{display:'grid',gap:12,maxWidth:420}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <input placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <button type="submit" disabled={loading}>{loading? 'Patiente...' : 'Se connecter'}</button>
      </form>
    </main>
  )
}
