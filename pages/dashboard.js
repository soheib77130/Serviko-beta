import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/useAuth'
import { useI18n } from '../lib/i18n'

const CAT_LABELS = {
  video: { fr: 'Vidéo & montage', en: 'Video & editing', icon: '🎬' },
  web: { fr: 'Site web', en: 'Website', icon: '💻' },
  design: { fr: 'Logo & design', en: 'Logo & design', icon: '🎨' },
  writing: { fr: 'Rédaction', en: 'Writing', icon: '✍️' },
  other: { fr: 'Autre', en: 'Other', icon: '⚡' },
}

export default function Dashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const { t, lang } = useI18n()
  const [requests, setRequests] = useState([])
  const [missions, setMissions] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!loading && profile && profile.role === 'independent') router.push('/indep/dashboard')
  }, [loading, user, profile])

  useEffect(() => {
    if (!profile || profile.role !== 'client') return
    loadData()
  }, [profile])

  async function loadData() {
    setFetching(true)
    const [reqRes, misRes] = await Promise.all([
      supabase
        .from('requests')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('missions')
        .select('*, requests(title, category)')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false }),
    ])
    setRequests(reqRes.data || [])
    setMissions(misRes.data || [])
    setFetching(false)
  }

  const statusBadge = (status) => {
    const map = {
      open: <span className="badge badge-open">{t('client.request.status.open')}</span>,
      matched: <span className="badge badge-matched">{t('client.request.status.matched')}</span>,
      closed: <span className="badge badge-closed">{t('client.request.status.closed')}</span>,
    }
    return map[status] || <span className="badge">{status}</span>
  }

  const missionStatusBadge = (status) => {
    const map = {
      ongoing: <span className="badge badge-ongoing">{t('mission.status.ongoing')}</span>,
      delivered: <span className="badge badge-delivered">{t('mission.status.delivered')}</span>,
      completed: <span className="badge badge-completed">{t('mission.status.completed')}</span>,
    }
    return map[status] || <span className="badge">{status}</span>
  }

  if (loading || fetching) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span>{t('loading')}</span>
      </div>
    )
  }

  return (
    <main className="page">
      <div className="dashboard-wrap">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{t('client.dashboard.title')}</h1>
            <p className="small" style={{ marginTop: 4 }}>
              {lang === 'fr' ? `Bonjour, ${profile?.full_name}` : `Hello, ${profile?.full_name}`}
            </p>
          </div>
          <Link href="/request/new">
            <button className="btn btn-primary">+ {t('client.new_request')}</button>
          </Link>
        </div>

        {/* ── ACTIVE MISSIONS ── */}
        {missions.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <p className="section-label">{t('client.missions.title')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {missions.map(m => (
                <div key={m.id} className="request-card">
                  <div className="request-card-header">
                    <div>
                      <div className="request-card-title">{m.requests?.title || 'Mission'}</div>
                      <div className="request-card-meta">
                        {m.requests?.category && (
                          <span>{CAT_LABELS[m.requests.category]?.icon} {CAT_LABELS[m.requests.category]?.[lang] || m.requests.category}</span>
                        )}
                        {m.price && <span>{lang === 'fr' ? 'Prix' : 'Price'} : {m.price}€</span>}
                        {m.paid && <span className="badge badge-paid">{t('mission.paid_badge')}</span>}
                      </div>
                    </div>
                    {missionStatusBadge(m.status)}
                  </div>
                  <div className="request-card-actions">
                    <Link href={`/mission/${m.id}`}>
                      <button className="btn btn-ghost btn-sm">{t('client.view_mission')} →</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── REQUESTS ── */}
        <section>
          <p className="section-label">{t('client.dashboard.title')}</p>
          {requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>{t('client.no_requests')}</p>
              <Link href="/request/new">
                <button className="btn btn-primary" style={{ marginTop: 16 }}>+ {t('client.new_request')}</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.map(r => (
                <div key={r.id} className="request-card">
                  <div className="request-card-header">
                    <div>
                      <div className="request-card-title">{r.title}</div>
                      <div className="request-card-meta">
                        {r.category && (
                          <span>{CAT_LABELS[r.category]?.icon} {CAT_LABELS[r.category]?.[lang] || r.category}</span>
                        )}
                        {r.budget_min && r.budget_max && (
                          <span>{r.budget_min}€ – {r.budget_max}€</span>
                        )}
                        <span style={{ color: 'var(--muted2)' }}>
                          {new Date(r.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB')}
                        </span>
                      </div>
                    </div>
                    {statusBadge(r.status)}
                  </div>
                  {r.description && (
                    <p className="small" style={{ color: 'var(--text2)', WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                      {r.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
