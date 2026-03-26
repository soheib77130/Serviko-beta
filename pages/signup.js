import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useI18n } from '../lib/i18n'

const CATEGORIES = [
  { key: 'video', label_fr: 'Vidéo & montage', label_en: 'Video & editing', icon: '🎬' },
  { key: 'web', label_fr: 'Site web', label_en: 'Website', icon: '💻' },
  { key: 'design', label_fr: 'Logo & design', label_en: 'Logo & design', icon: '🎨' },
  { key: 'writing', label_fr: 'Rédaction', label_en: 'Writing', icon: '✍️' },
  { key: 'other', label_fr: 'Autre', label_en: 'Other', icon: '⚡' },
]

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('client')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { t, lang } = useI18n()

  useEffect(() => {
    if (router.query.role === 'independent') setRole('independent')
  }, [router.query])

  const toggleCat = (key) => {
    setCategories(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key])
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (role === 'independent' && categories.length === 0) {
      setError(lang === 'fr' ? 'Sélectionne au moins une catégorie.' : 'Select at least one category.')
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase.auth.signUp({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (userId) {
      const { error: profileErr } = await supabase.from('profiles').insert({
        id: userId,
        full_name: fullName,
        role,
        skills: [],
        categories: role === 'independent' ? categories : [],
        online: false,
      })
      if (profileErr) {
        // Profile might already exist (upsert)
        await supabase.from('profiles').upsert({
          id: userId,
          full_name: fullName,
          role,
          categories: role === 'independent' ? categories : [],
        })
      }
    }

    setLoading(false)
    alert(t('auth.success'))
    router.push('/login')
  }

  return (
    <main className="page">
      <div className="container-sm" style={{ paddingTop: 60 }}>
        <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{t('auth.signup')}</h1>
          <p className="small" style={{ marginBottom: 24 }}>
            {t('auth.has_account')}{' '}
            <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{t('auth.login')}</Link>
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">{t('auth.fullname')}</label>
              <input
                className="input"
                placeholder="Jean Dupont"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
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
                minLength={6}
                required
              />
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label">{lang === 'fr' ? 'Je suis' : 'I am'}</label>
              <div className="role-grid">
                <div
                  className={`role-card ${role === 'client' ? 'selected' : ''}`}
                  onClick={() => setRole('client')}
                >
                  <div className="role-icon">🏢</div>
                  <div className="role-label">{t('auth.role.client')}</div>
                  <div className="role-desc">{lang === 'fr' ? 'Je cherche un indépendant' : 'I need a freelancer'}</div>
                </div>
                <div
                  className={`role-card ${role === 'independent' ? 'selected' : ''}`}
                  onClick={() => setRole('independent')}
                >
                  <div className="role-icon">💼</div>
                  <div className="role-label">{t('auth.role.indep')}</div>
                  <div className="role-desc">{lang === 'fr' ? 'Je propose mes services' : 'I offer my services'}</div>
                </div>
              </div>
            </div>

            {/* Categories (only for independent) */}
            {role === 'independent' && (
              <div className="form-group">
                <label className="form-label">{t('auth.categories.label')}</label>
                <div className="cats-grid">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.key}
                      type="button"
                      className={`cat-chip ${categories.includes(c.key) ? 'active' : ''}`}
                      onClick={() => toggleCat(c.key)}
                    >
                      {c.icon} {lang === 'fr' ? c.label_fr : c.label_en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? t('auth.loading') : t('auth.signup')}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
