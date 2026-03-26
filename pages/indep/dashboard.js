import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/useAuth'
import { useI18n } from '../../lib/i18n'

const CAT_LABELS = {
  video: { fr: 'Vidéo & montage', en: 'Video & editing', icon: '🎬' },
  web: { fr: 'Site web', en: 'Website', icon: '💻' },
  design: { fr: 'Logo & design', en: 'Logo & design', icon: '🎨' },
  writing: { fr: 'Rédaction', en: 'Writing', icon: '✍️' },
  other: { fr: 'Autre', en: 'Other', icon: '⚡' },
}

const ALL_CATS = ['video', 'web', 'design', 'writing', 'other']

export default function IndepDashboard() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const { t, lang } = useI18n()

  const [matches, setMatches] = useState([])
  const [missions, setMissions] = useState([])
  const [fetching, setFetching] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [editCats, setEditCats] = useState(false)
  const [localCats, setLocalCats] = useState([])
  const [savingCats, setSavingCats] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)

  const channelRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!loading && profile && profile.role === 'client') router.push('/dashboard')
  }, [loading, user, profile])

  useEffect(() => {
    if (!profile || profile.role !== 'independent') return
    setLocalCats(profile.categories || [])
    loadData()
    subscribeToMatches()
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [profile])

  async function loadData() {
    setFetching(true)
    const [matchRes, misRes] = await Promise.all([
      supabase
        .from('request_matches')
        .select('*, requests(id, title, description, category, budget_min, budget_max, deadline, urgency, collaboration_mode, created_at, profiles(full_name))')
        .eq('independent_profile_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('missions')
        .select('*, requests(title, category, client_id, profiles(full_name))')
        .eq('independent_id', profile.id)
        .order('created_at', { ascending: false }),
    ])
    setMatches(matchRes.data || [])
    setMissions(misRes.data || [])
    setFetching(false)
  }

  function subscribeToMatches() {
    const ch = supabase
      .channel(`indep-matches-${profile.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'request_matches', filter: `independent_profile_id=eq.${profile.id}` },
        async (payload) => {
          // Fetch the full match with request details
          const { data } = await supabase
            .from('request_matches')
            .select('*, requests(id, title, description, category, budget_min, budget_max, deadline, urgency, collaboration_mode, created_at, profiles(full_name))')
            .eq('id', payload.new.id)
            .single()
          if (data) setMatches(prev => [data, ...prev])
        }
      )
      .subscribe()
    channelRef.current = ch
  }

  async function toggleOnline() {
    if (!profile) return
    setToggling(true)
    const newStatus = !profile.online
    await supabase.from('profiles').update({ online: newStatus }).eq('id', profile.id)
    await refreshProfile()
    setToggling(false)
  }

  async function handleAccept(match) {
    setActionLoading(match.id)
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    const res = await fetch(`/api/matches/${match.id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setMatches(prev => prev.filter(m => m.id !== match.id))
      await loadData()
    } else {
      const d = await res.json()
      alert(d.error || 'Erreur')
    }
    setActionLoading(null)
  }

  async function handleDecline(match) {
    setActionLoading(match.id)
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    await fetch(`/api/matches/${match.id}/decline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    setMatches(prev => prev.filter(m => m.id !== match.id))
    setActionLoading(null)
  }

  async function saveCats() {
    setSavingCats(true)
    await supabase.from('profiles').update({ categories: localCats }).eq('id', profile.id)
    await refreshProfile()
    setEditCats(false)
    setSavingCats(false)
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
            <h1 className="dashboard-title">{t('indep.dashboard.title')}</h1>
            <p className="small" style={{ marginTop: 4 }}>
              {lang === 'fr' ? `Bonjour, ${profile?.full_name}` : `Hello, ${profile?.full_name}`}
            </p>
          </div>
          {/* Online toggle */}
          <div className="toggle-wrap">
            <span className={`status-dot ${profile?.online ? 'on' : ''}`} />
            <span className="toggle-label">
              {profile?.online ? t('indep.status.online') : t('indep.status.offline')}
            </span>
            <button
              className={`toggle ${profile?.online ? 'on' : ''}`}
              onClick={toggleOnline}
              disabled={toggling}
              title={profile?.online ? t('indep.status.online') : t('indep.status.offline')}
            />
          </div>
        </div>

        <div className="dashboard-grid">
          {/* ── SIDEBAR ── */}
          <aside className="sidebar">
            <div className="card">
              <div className="profile-row" style={{ marginBottom: 14 }}>
                <div className="avatar avatar-lg">
                  {profile?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{profile?.full_name}</div>
                  <div className="small">{lang === 'fr' ? 'Indépendant' : 'Freelancer'}</div>
                </div>
              </div>

              <hr className="divider" />

              <div>
                <div className="flex-between" style={{ marginBottom: 10 }}>
                  <span className="section-label" style={{ marginBottom: 0 }}>{t('indep.categories_label')}</span>
                  {!editCats && (
                    <button className="btn btn-ghost btn-xs" onClick={() => { setEditCats(true); setLocalCats(profile?.categories || []) }}>
                      ✏️
                    </button>
                  )}
                </div>

                {editCats ? (
                  <div>
                    <div className="cats-grid" style={{ marginBottom: 12 }}>
                      {ALL_CATS.map(c => (
                        <button
                          key={c}
                          type="button"
                          className={`cat-chip ${localCats.includes(c) ? 'active' : ''}`}
                          onClick={() => setLocalCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                        >
                          {CAT_LABELS[c].icon} {CAT_LABELS[c][lang]}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={saveCats} disabled={savingCats}>
                        {savingCats ? '...' : t('indep.save_categories')}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditCats(false)}>
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="cats-grid">
                    {(profile?.categories || []).length === 0 ? (
                      <span className="small">{lang === 'fr' ? 'Aucune catégorie' : 'No category'}</span>
                    ) : (
                      (profile?.categories || []).map(c => (
                        <span key={c} className="cat-chip active" style={{ cursor: 'default' }}>
                          {CAT_LABELS[c]?.icon} {CAT_LABELS[c]?.[lang] || c}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="card">
              <p className="section-label">{lang === 'fr' ? 'Statistiques' : 'Stats'}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="flex-between">
                  <span className="small">{lang === 'fr' ? 'Missions actives' : 'Active missions'}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                    {missions.filter(m => m.status === 'ongoing').length}
                  </span>
                </div>
                <div className="flex-between">
                  <span className="small">{lang === 'fr' ? 'Missions terminées' : 'Completed missions'}</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {missions.filter(m => m.status === 'completed').length}
                  </span>
                </div>
                <div className="flex-between">
                  <span className="small">{lang === 'fr' ? 'Demandes en attente' : 'Pending requests'}</span>
                  <span style={{ fontWeight: 700, color: 'var(--warning)' }}>
                    {matches.length}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── MAIN AREA ── */}
          <div className="main-area">
            {/* Pending match requests */}
            <section>
              <p className="section-label">
                {t('indep.new_requests')}
                {matches.length > 0 && (
                  <span className="badge badge-pending" style={{ marginLeft: 8 }}>{matches.length}</span>
                )}
              </p>

              {matches.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}>
                  <div className="empty-state-icon">📨</div>
                  <p>{t('indep.no_requests')}</p>
                  <p className="small" style={{ marginTop: 8 }}>
                    {profile?.online
                      ? (lang === 'fr' ? 'Tu es en ligne — les nouvelles demandes apparaîtront ici.' : "You're online — new requests will appear here.")
                      : (lang === 'fr' ? 'Passe en ligne pour recevoir des demandes.' : 'Go online to receive requests.')}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {matches.map(m => {
                    const req = m.requests
                    return (
                      <div key={m.id} className="request-card">
                        <div className="request-card-header">
                          <div style={{ flex: 1 }}>
                            <div className="request-card-title">{req?.title}</div>
                            <div className="request-card-meta">
                              {req?.category && (
                                <span>{CAT_LABELS[req.category]?.icon} {CAT_LABELS[req.category]?.[lang] || req.category}</span>
                              )}
                              {req?.budget_min && req?.budget_max && (
                                <span>💰 {req.budget_min}€ – {req.budget_max}€</span>
                              )}
                              {req?.urgency && (
                                <span>⏱ {t(`request.urgency.${req.urgency}`)}</span>
                              )}
                              {req?.deadline && req?.deadline !== 'flexible' && (
                                <span>📅 {t(`request.deadline.${req.deadline}`)}</span>
                              )}
                            </div>
                          </div>
                          <span className="badge badge-pending">{t('status.pending')}</span>
                        </div>

                        {req?.description && (
                          <p className="small" style={{ color: 'var(--text2)', lineHeight: 1.6 }}>
                            {req.description.length > 200 ? req.description.slice(0, 200) + '...' : req.description}
                          </p>
                        )}

                        {req?.collaboration_mode && (
                          <p className="small">
                            🤝 {t(`request.collab.${req.collaboration_mode}`)}
                          </p>
                        )}

                        <div className="request-card-actions">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAccept(m)}
                            disabled={actionLoading === m.id}
                          >
                            {actionLoading === m.id ? '...' : `✓ ${t('indep.accept')}`}
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDecline(m)}
                            disabled={actionLoading === m.id}
                          >
                            {`✗ ${t('indep.decline')}`}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Active missions */}
            <section>
              <p className="section-label">{t('indep.my_missions')}</p>
              {missions.length === 0 ? (
                <div className="empty-state" style={{ padding: 24 }}>
                  <div className="empty-state-icon">🚀</div>
                  <p>{t('indep.no_missions')}</p>
                </div>
              ) : (
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
                          <button className="btn btn-ghost btn-sm">{t('see_details')} →</button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
