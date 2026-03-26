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

export default function MissionPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, profile, loading } = useAuth()
  const { t, lang } = useI18n()

  const [mission, setMission] = useState(null)
  const [request, setRequest] = useState(null)
  const [clientProfile, setClientProfile] = useState(null)
  const [indepProfile, setIndepProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [files, setFiles] = useState([])
  const [activeTab, setActiveTab] = useState('messages')
  const [fetching, setFetching] = useState(true)

  // Message state
  const [msgBody, setMsgBody] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  // Price modal
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [priceInput, setPriceInput] = useState('')
  const [settingPrice, setSettingPrice] = useState(false)

  // Payment
  const [paying, setPaying] = useState(false)

  // Deliver
  const [uploadFiles, setUploadFiles] = useState([])
  const [delivering, setDelivering] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Complete
  const [completing, setCompleting] = useState(false)

  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user])

  useEffect(() => {
    if (id && profile) loadMission()
  }, [id, profile])

  async function getToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  }

  async function loadMission() {
    setFetching(true)
    const { data: mis } = await supabase
      .from('missions')
      .select('*')
      .eq('id', id)
      .single()

    if (!mis) { router.push(profile?.role === 'independent' ? '/indep/dashboard' : '/dashboard'); return }
    setMission(mis)

    const [reqRes, clientRes, indepRes, msgRes, fileRes] = await Promise.all([
      supabase.from('requests').select('*').eq('id', mis.request_id).single(),
      supabase.from('profiles').select('*').eq('id', mis.client_id).single(),
      supabase.from('profiles').select('*').eq('id', mis.independent_id).single(),
      supabase.from('messages').select('*, profiles(full_name)').eq('mission_id', id).order('created_at', { ascending: true }),
      supabase.from('files').select('*').eq('mission_id', id).order('created_at', { ascending: true }),
    ])

    setRequest(reqRes.data)
    setClientProfile(clientRes.data)
    setIndepProfile(indepRes.data)
    setMessages(msgRes.data || [])
    setFiles(fileRes.data || [])
    setFetching(false)

    subscribeToMessages()
  }

  function subscribeToMessages() {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    const ch = supabase
      .channel(`mission-messages-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `mission_id=eq.${id}` },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, profiles(full_name)')
            .eq('id', payload.new.id)
            .single()
          if (data) setMessages(prev => [...prev, data])
        }
      )
      .subscribe()
    channelRef.current = ch
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  async function sendMessage(e) {
    e.preventDefault()
    if (!msgBody.trim()) return
    setSendingMsg(true)
    await supabase.from('messages').insert({
      mission_id: id,
      sender_id: user.id,
      body: msgBody.trim(),
    })
    setMsgBody('')
    setSendingMsg(false)
  }

  async function proposePrice() {
    if (!priceInput || isNaN(Number(priceInput))) return
    setSettingPrice(true)
    const token = await getToken()
    const res = await fetch(`/api/missions/${id}/price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ price: Number(priceInput) }),
    })
    if (res.ok) {
      const d = await res.json()
      setMission(prev => ({ ...prev, price: d.price }))
      setShowPriceModal(false)
      setPriceInput('')
      // Send auto-message
      await supabase.from('messages').insert({
        mission_id: id,
        sender_id: user.id,
        body: lang === 'fr'
          ? `💰 Je propose un prix de ${d.price}€ pour cette mission. (hors commission)`
          : `💰 I'm proposing a price of €${d.price} for this mission. (excluding commission)`,
      })
    }
    setSettingPrice(false)
  }

  async function handlePay() {
    if (!mission.price) {
      alert(lang === 'fr' ? 'Aucun prix proposé. Discutez d\'abord avec l\'indépendant.' : 'No price proposed yet. Discuss with the freelancer first.')
      return
    }
    setPaying(true)
    const token = await getToken()
    const res = await fetch(`/api/missions/${id}/pay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setMission(prev => ({ ...prev, paid: true, commission: prev.price * 0.02 }))
    } else {
      const d = await res.json()
      alert(d.error || t('error'))
    }
    setPaying(false)
  }

  async function handleDeliver() {
    if (uploadFiles.length === 0) {
      alert(lang === 'fr' ? 'Sélectionne au moins un fichier.' : 'Select at least one file.')
      return
    }
    setDelivering(true)
    const token = await getToken()

    const uploadedPaths = []
    for (const file of uploadFiles) {
      const path = `missions/${id}/${Date.now()}_${file.name.replace(/\s/g, '_')}`
      const { error } = await supabase.storage.from('livrables').upload(path, file)
      if (!error) {
        uploadedPaths.push({ path, filename: file.name })
      }
    }

    if (uploadedPaths.length > 0) {
      const res = await fetch(`/api/missions/${id}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ files: uploadedPaths }),
      })
      if (res.ok) {
        setMission(prev => ({ ...prev, status: 'delivered' }))
        const newFiles = uploadedPaths.map(f => ({
          ...f, mission_id: id, uploaded_by: user.id, created_at: new Date().toISOString()
        }))
        setFiles(prev => [...prev, ...newFiles])
        setUploadFiles([])
        // Auto-message
        await supabase.from('messages').insert({
          mission_id: id,
          sender_id: user.id,
          body: lang === 'fr'
            ? `📦 J'ai livré ${uploadedPaths.length} fichier(s). Vérifie l'onglet Livrables.`
            : `📦 I've delivered ${uploadedPaths.length} file(s). Check the Deliverables tab.`,
        })
      }
    }
    setDelivering(false)
  }

  async function handleComplete() {
    if (!window.confirm(lang === 'fr' ? 'Confirmer la fin de la mission ?' : 'Confirm mission completion?')) return
    setCompleting(true)
    const token = await getToken()
    const res = await fetch(`/api/missions/${id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setMission(prev => ({ ...prev, status: 'completed' }))
    }
    setCompleting(false)
  }

  async function getFileUrl(path) {
    const { data } = supabase.storage.from('livrables').getPublicUrl(path)
    return data.publicUrl
  }

  const isClient = profile?.id === mission?.client_id
  const isIndep = profile?.id === mission?.independent_id

  if (loading || fetching) {
    return <div className="loading-page"><div className="spinner" /></div>
  }

  if (!mission) return null

  const commission = mission.price ? mission.price * 0.02 : 0
  const total = mission.price ? mission.price + commission : 0

  const statusSteps = [
    { key: 'ongoing', label: lang === 'fr' ? 'En cours' : 'Ongoing' },
    { key: 'delivered', label: lang === 'fr' ? 'Livré' : 'Delivered' },
    { key: 'completed', label: lang === 'fr' ? 'Terminé' : 'Completed' },
  ]
  const currentStep = statusSteps.findIndex(s => s.key === mission.status)

  return (
    <main className="page">
      <div className="dashboard-wrap">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Link href={isIndep ? '/indep/dashboard' : '/dashboard'} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 13 }}>
            ← {t('back')}
          </Link>
        </div>

        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{request?.title || t('mission.title')}</h1>
            <div className="flex-gap" style={{ marginTop: 6, flexWrap: 'wrap', gap: 8 }}>
              {request?.category && (
                <span className="small">{CAT_LABELS[request.category]?.icon} {CAT_LABELS[request.category]?.[lang]}</span>
              )}
              {isClient && indepProfile && (
                <span className="small">🤝 {indepProfile.full_name}</span>
              )}
              {isIndep && clientProfile && (
                <span className="small">👤 {clientProfile.full_name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="mission-status-bar" style={{ marginBottom: 28 }}>
          {statusSteps.map((step, i) => (
            <div
              key={step.key}
              className={`mission-status-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}
            >
              {i < currentStep ? '✓ ' : ''}{step.label}
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* ── MAIN (messages / livrables) ── */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="tab-nav">
              <button className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
                💬 {t('mission.tab.messages')}
              </button>
              <button className={`tab-btn ${activeTab === 'deliverables' ? 'active' : ''}`} onClick={() => setActiveTab('deliverables')}>
                📦 {t('mission.tab.deliverables')}
              </button>
              <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                📋 {t('mission.tab.details')}
              </button>
            </div>

            {/* ── MESSAGES TAB ── */}
            {activeTab === 'messages' && (
              <div>
                <div className="chat-wrap">
                  <div className="chat-messages">
                    {messages.length === 0 ? (
                      <div className="empty-chat">{t('mission.no_messages')}</div>
                    ) : (
                      messages.map(msg => {
                        const isMine = msg.sender_id === user?.id
                        return (
                          <div key={msg.id} className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                            <div className="msg-content">{msg.body}</div>
                            <div className="msg-meta">
                              {!isMine && <span>{msg.profiles?.full_name} · </span>}
                              {new Date(msg.created_at).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <form className="chat-input-row" onSubmit={sendMessage}>
                    <input
                      className="input"
                      placeholder={t('mission.msg_placeholder')}
                      value={msgBody}
                      onChange={e => setMsgBody(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={sendingMsg || !msgBody.trim()}>
                      {t('mission.send')}
                    </button>
                  </form>
                </div>

                {/* Price & payment section */}
                <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Price proposal (indep only) */}
                  {isIndep && mission.status === 'ongoing' && (
                    <div className="card">
                      <p style={{ fontWeight: 600, marginBottom: 12 }}>
                        {mission.price
                          ? `💰 ${t('mission.price_label')} : ${mission.price}€`
                          : (lang === 'fr' ? '💰 Aucun prix proposé' : '💰 No price proposed yet')}
                      </p>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setPriceInput(mission.price || ''); setShowPriceModal(true) }}>
                        {t('mission.propose_price')}
                      </button>
                    </div>
                  )}

                  {/* Payment (client only) */}
                  {isClient && (
                    <div className="payment-box">
                      {mission.paid ? (
                        <div style={{ textAlign: 'center', padding: 8 }}>
                          <span style={{ fontSize: 24 }}>✅</span>
                          <p style={{ fontWeight: 700, color: 'var(--success)', marginTop: 8 }}>{t('mission.paid_badge')}</p>
                        </div>
                      ) : mission.price ? (
                        <>
                          <div className="payment-row">
                            <span>{t('mission.price_label')}</span>
                            <span>{mission.price}€</span>
                          </div>
                          <div className="payment-row">
                            <span>{t('mission.commission_label')}</span>
                            <span>{commission.toFixed(2)}€</span>
                          </div>
                          <div className="payment-row total">
                            <span>{t('mission.total_label')}</span>
                            <span>{total.toFixed(2)}€</span>
                          </div>
                          <button
                            className="btn btn-primary btn-full"
                            style={{ marginTop: 14 }}
                            onClick={handlePay}
                            disabled={paying}
                          >
                            {paying ? '...' : t('mission.pay_btn')}
                          </button>
                          <p className="payment-sim">{t('mission.pay_simulation')}</p>
                        </>
                      ) : (
                        <p className="small" style={{ textAlign: 'center' }}>
                          {lang === 'fr'
                            ? "En attente d'une proposition de prix de l'indépendant."
                            : "Waiting for the freelancer's price proposal."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── DELIVERABLES TAB ── */}
            {activeTab === 'deliverables' && (
              <div>
                {/* Upload (indep only, when ongoing or delivered) */}
                {isIndep && (mission.status === 'ongoing' || mission.status === 'delivered') && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontWeight: 600, marginBottom: 12 }}>{t('mission.upload_label')}</p>
                    <div
                      className={`upload-area ${dragOver ? 'drag' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => {
                        e.preventDefault()
                        setDragOver(false)
                        const dropped = Array.from(e.dataTransfer.files)
                        setUploadFiles(prev => [...prev, ...dropped])
                      }}
                    >
                      <div className="upload-icon">📁</div>
                      <p className="upload-text">
                        {lang === 'fr' ? 'Glisse tes fichiers ici ou clique pour choisir' : 'Drag files here or click to choose'}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={e => setUploadFiles(prev => [...prev, ...Array.from(e.target.files)])}
                      />
                    </div>
                    {uploadFiles.length > 0 && (
                      <div className="file-list" style={{ marginTop: 12 }}>
                        {uploadFiles.map((f, i) => (
                          <div key={i} className="file-item">
                            <span className="file-item-name">📄 {f.name}</span>
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => setUploadFiles(prev => prev.filter((_, j) => j !== i))}
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadFiles.length > 0 && (
                      <button
                        className="btn btn-success"
                        style={{ marginTop: 14 }}
                        onClick={handleDeliver}
                        disabled={delivering}
                      >
                        {delivering ? '...' : `📦 ${t('mission.deliver_btn')}`}
                      </button>
                    )}
                  </div>
                )}

                {/* Delivered files */}
                <p style={{ fontWeight: 600, marginBottom: 12 }}>{t('mission.files_delivered')}</p>
                {files.length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}>
                    <div className="empty-state-icon">📭</div>
                    <p>{t('mission.no_files')}</p>
                  </div>
                ) : (
                  <div className="file-list">
                    {files.map(f => (
                      <FileItem key={f.id} file={f} />
                    ))}
                  </div>
                )}

                {/* Complete button (client only, when delivered) */}
                {isClient && mission.status === 'delivered' && (
                  <div style={{ marginTop: 24, padding: 20, background: 'rgba(34,197,94,0.06)', borderRadius: 'var(--radius)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <p style={{ fontWeight: 600, marginBottom: 12 }}>
                      {lang === 'fr' ? "L'indépendant a livré son travail. Tout est conforme ?" : "The freelancer has delivered their work. Is everything correct?"}
                    </p>
                    <button
                      className="btn btn-success"
                      onClick={handleComplete}
                      disabled={completing}
                    >
                      {completing ? '...' : `✓ ${t('mission.complete_btn')}`}
                    </button>
                  </div>
                )}

                {mission.status === 'completed' && (
                  <div className="alert alert-success" style={{ marginTop: 16 }}>
                    🎉 {t('mission.completed_msg')}
                  </div>
                )}
              </div>
            )}

            {/* ── DETAILS TAB ── */}
            {activeTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {request && (
                  <div className="card">
                    <p className="section-label">{t('mission.request_details')}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <span className="form-label">{lang === 'fr' ? 'Titre' : 'Title'}</span>
                        <p style={{ marginTop: 4 }}>{request.title}</p>
                      </div>
                      <div>
                        <span className="form-label">{lang === 'fr' ? 'Catégorie' : 'Category'}</span>
                        <p style={{ marginTop: 4 }}>
                          {CAT_LABELS[request.category]?.icon} {CAT_LABELS[request.category]?.[lang] || request.category}
                        </p>
                      </div>
                      {request.description && (
                        <div>
                          <span className="form-label">{lang === 'fr' ? 'Description' : 'Description'}</span>
                          <p style={{ marginTop: 4, color: 'var(--text2)', lineHeight: 1.7 }}>{request.description}</p>
                        </div>
                      )}
                      <div className="form-row">
                        {request.budget_min && (
                          <div>
                            <span className="form-label">{lang === 'fr' ? 'Budget min' : 'Min budget'}</span>
                            <p style={{ marginTop: 4 }}>{request.budget_min}€</p>
                          </div>
                        )}
                        {request.budget_max && (
                          <div>
                            <span className="form-label">{lang === 'fr' ? 'Budget max' : 'Max budget'}</span>
                            <p style={{ marginTop: 4 }}>{request.budget_max}€</p>
                          </div>
                        )}
                        {request.deadline && (
                          <div>
                            <span className="form-label">{lang === 'fr' ? 'Délai' : 'Deadline'}</span>
                            <p style={{ marginTop: 4 }}>{request.deadline}</p>
                          </div>
                        )}
                        {request.urgency && (
                          <div>
                            <span className="form-label">{lang === 'fr' ? 'Urgence' : 'Urgency'}</span>
                            <p style={{ marginTop: 4 }}>{request.urgency}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="card">
                  <p className="section-label">{lang === 'fr' ? 'Participants' : 'Participants'}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="profile-row">
                      <div className="avatar">{clientProfile?.full_name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{clientProfile?.full_name}</div>
                        <div className="small">{t('mission.client')}</div>
                      </div>
                    </div>
                    <div className="profile-row">
                      <div className="avatar" style={{ background: 'linear-gradient(135deg,#7dd3fc,#a78bfa)' }}>
                        {indepProfile?.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{indepProfile?.full_name}</div>
                        <div className="small">{t('mission.indep')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price modal */}
      {showPriceModal && (
        <div className="modal-overlay" onClick={() => setShowPriceModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{t('mission.propose_price')}</h2>
            <div className="form-group">
              <label className="form-label">{t('mission.price_input')}</label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="500"
                value={priceInput}
                onChange={e => setPriceInput(e.target.value)}
                autoFocus
              />
            </div>
            <p className="small" style={{ marginTop: 8 }}>
              {lang === 'fr'
                ? '+ 2% de commission Serviko seront ajoutés au montant final.'
                : '+ 2% Serviko commission will be added to the final amount.'}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowPriceModal(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" onClick={proposePrice} disabled={settingPrice}>
                {settingPrice ? '...' : t('mission.propose_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function FileItem({ file }) {
  const [url, setUrl] = useState(null)
  const { lang } = useI18n()

  useEffect(() => {
    if (file.path) {
      const { data } = supabase.storage.from('livrables').getPublicUrl(file.path)
      setUrl(data?.publicUrl)
    }
  }, [file.path])

  return (
    <div className="file-item">
      <span className="file-item-name">
        📄 {file.filename || file.path?.split('/').pop() || 'Fichier'}
      </span>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer">
          ⬇ {lang === 'fr' ? 'Télécharger' : 'Download'}
        </a>
      )}
    </div>
  )
}
