import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/useAuth'
import { useI18n } from '../../lib/i18n'

const CATEGORIES = [
  { key: 'video', icon: '🎬' },
  { key: 'web', icon: '💻' },
  { key: 'design', icon: '🎨' },
  { key: 'writing', icon: '✍️' },
  { key: 'other', icon: '⚡' },
]

export default function NewRequest() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const { t, lang } = useI18n()

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    budget_min: '',
    budget_max: '',
    deadline: 'flexible',
    urgency: 'normal',
    collaboration_mode: 'chat',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!loading && profile?.role === 'independent') router.push('/indep/dashboard')
  }, [loading, user, profile])

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) { setError(lang === 'fr' ? 'Sélectionne une catégorie.' : 'Select a category.'); return }
    setError('')
    setSubmitting(true)

    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: form.title,
        category: form.category,
        description: form.description,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        deadline: form.deadline,
        urgency: form.urgency,
        collaboration_mode: form.collaboration_mode,
      }),
    })

    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(data.error || t('error'))
    } else {
      setSuccess(data)
    }
  }

  if (loading) {
    return <div className="loading-page"><div className="spinner" /></div>
  }

  if (success) {
    return (
      <main className="page">
        <div className="container-sm" style={{ paddingTop: 60 }}>
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{t('request.submitted')}</h2>
            {success.matchCount > 0 ? (
              <p className="small" style={{ marginBottom: 24 }}>
                {t('request.matched', { n: success.matchCount })}
              </p>
            ) : (
              <p className="small" style={{ marginBottom: 24 }}>
                {lang === 'fr'
                  ? 'Aucun indépendant en ligne pour cette catégorie pour le moment. Ta demande reste active.'
                  : 'No freelancers online for this category right now. Your request stays active.'}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/dashboard">
                <button className="btn btn-primary">{t('nav.dashboard')}</button>
              </Link>
              <button className="btn btn-ghost" onClick={() => { setSuccess(null); setForm({ title: '', category: '', description: '', budget_min: '', budget_max: '', deadline: 'flexible', urgency: 'normal', collaboration_mode: 'chat' }) }}>
                {lang === 'fr' ? 'Nouvelle demande' : 'New request'}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="container-sm" style={{ paddingTop: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 13 }}>
            ← {t('back')}
          </Link>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>{t('request.new.title')}</h1>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">{t('request.title_label')} *</label>
            <input
              className="input"
              placeholder={lang === 'fr' ? 'Ex: Montage vidéo promotionnel 30 secondes' : 'Ex: 30-second promo video editing'}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">{t('request.category_label')} *</label>
            <div className="cats-grid">
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  type="button"
                  className={`cat-chip ${form.category === c.key ? 'active' : ''}`}
                  onClick={() => set('category', c.key)}
                >
                  {c.icon} {t(`cat.${c.key}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">{t('request.description_label')} *</label>
            <textarea
              className="textarea"
              placeholder={lang === 'fr'
                ? 'Décris ta mission en détail : objectif, contenu, style attendu, contraintes...'
                : 'Describe your mission in detail: goal, content, expected style, constraints...'}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={5}
              required
            />
          </div>

          {/* Budget */}
          <div className="form-group">
            <label className="form-label">{lang === 'fr' ? 'Budget (€)' : 'Budget (€)'}</label>
            <div className="form-row">
              <input
                className="input"
                placeholder={t('request.budget_min')}
                value={form.budget_min}
                onChange={e => set('budget_min', e.target.value)}
                type="number"
                min="0"
              />
              <input
                className="input"
                placeholder={t('request.budget_max')}
                value={form.budget_max}
                onChange={e => set('budget_max', e.target.value)}
                type="number"
                min="0"
              />
            </div>
          </div>

          {/* Deadline + Urgency */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('request.deadline_label')}</label>
              <select className="select" value={form.deadline} onChange={e => set('deadline', e.target.value)}>
                <option value="7">{t('request.deadline.7')}</option>
                <option value="14">{t('request.deadline.14')}</option>
                <option value="month">{t('request.deadline.month')}</option>
                <option value="flexible">{t('request.deadline.flexible')}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('request.urgency_label')}</label>
              <select className="select" value={form.urgency} onChange={e => set('urgency', e.target.value)}>
                <option value="urgent">{t('request.urgency.urgent')}</option>
                <option value="normal">{t('request.urgency.normal')}</option>
                <option value="flexible">{t('request.urgency.flexible')}</option>
              </select>
            </div>
          </div>

          {/* Collaboration mode */}
          <div className="form-group">
            <label className="form-label">{t('request.collab_label')}</label>
            <div className="radio-group">
              {['chat', 'weekly', 'autonomous'].map(mode => (
                <label
                  key={mode}
                  className={`radio-card ${form.collaboration_mode === mode ? 'selected' : ''}`}
                  onClick={() => set('collaboration_mode', mode)}
                >
                  <input
                    type="radio"
                    name="collab"
                    value={mode}
                    checked={form.collaboration_mode === mode}
                    onChange={() => set('collaboration_mode', mode)}
                  />
                  {t(`request.collab.${mode}`)}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ padding: '14px', fontSize: 15 }}>
            {submitting ? '...' : t('request.submit')}
          </button>
        </form>
      </div>
    </main>
  )
}
