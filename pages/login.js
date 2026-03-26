import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useI18n } from '../lib/i18n'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { t } = useI18n()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    // Redirect based on role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    setLoading(false)
    if (profile?.role === 'independent') {
      router.push('/indep/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="page">
      <div className="container-sm" style={{ paddingTop: 60 }}>
        <div className="card" style={{ maxWidth: 440, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{t('auth.login')}</h1>
          <p className="small" style={{ marginBottom: 24 }}>
            {t('auth.no_account')}{' '}
            <Link href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{t('auth.signup')}</Link>
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <input
                className="input"
                placeholder="email@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? t('auth.loading') : t('auth.login')}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
