import { useState } from 'react'
import Link from 'next/link'

const SQL = `-- Migration 003 — colle ce SQL dans Supabase > SQL Editor > Run

ALTER TABLE requests ADD COLUMN IF NOT EXISTS specs jsonb DEFAULT '{}';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS deadline text DEFAULT 'flexible';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS urgency text DEFAULT 'normal';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS collaboration_mode text DEFAULT 'chat';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE missions ADD COLUMN IF NOT EXISTS deliverable_note text;`

export default function Setup() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function runSetup() {
    setLoading(true)
    const res = await fetch('/api/setup', { method: 'POST' })
    const data = await res.json()
    setStatus(data.results)
    setLoading(false)
  }

  function copySQL() {
    navigator.clipboard.writeText(SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="page">
      <div className="container-sm" style={{ paddingTop: 48 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>⚙️ Configuration initiale Serviko</h1>
        <p className="text-muted" style={{ marginBottom: 32 }}>
          À faire une seule fois après le déploiement.
        </p>

        {/* Step 1 */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="step-num" style={{ margin: 0 }}>1</div>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Créer le bucket de stockage</h2>
          </div>
          <p className="small" style={{ marginBottom: 16 }}>
            Crée automatiquement le bucket Supabase Storage <strong>livrables</strong> (pour les fichiers déposés par les indépendants).
          </p>
          {status ? (
            <div>
              {status.map(r => (
                <div
                  key={r.task}
                  className={`alert ${r.status === 'error' ? 'alert-error' : 'alert-success'}`}
                >
                  {r.status === 'created' && '✅ Bucket "livrables" créé avec succès.'}
                  {r.status === 'already_exists' && '✅ Bucket "livrables" existe déjà — tout bon.'}
                  {r.status === 'error' && `❌ Erreur : ${r.message}`}
                </div>
              ))}
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={runSetup}
              disabled={loading}
            >
              {loading ? '⏳ En cours...' : '🚀 Initialiser le stockage'}
            </button>
          )}
        </div>

        {/* Step 2 */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="step-num" style={{ margin: 0 }}>2</div>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Appliquer la migration SQL</h2>
          </div>
          <p className="small" style={{ marginBottom: 16 }}>
            Va dans <strong>Supabase → SQL Editor → New query</strong>, colle ce code et clique <strong>Run</strong>.
          </p>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <pre style={{
              background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 8,
              fontSize: 12, lineHeight: 1.7, overflowX: 'auto',
              border: '1px solid var(--border)', color: 'var(--text2)'
            }}>
              {SQL}
            </pre>
            <button
              className="btn btn-ghost btn-sm"
              style={{ position: 'absolute', top: 8, right: 8 }}
              onClick={copySQL}
            >
              {copied ? '✅ Copié !' : '📋 Copier'}
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="card" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="step-num" style={{ margin: 0 }}>3</div>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Activer le Realtime Supabase</h2>
          </div>
          <p className="small" style={{ marginBottom: 8 }}>
            Dans Supabase → <strong>Database → Replication</strong>, active le Realtime pour ces tables :
          </p>
          <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
            <li><code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>request_matches</code> — pour les notifications en temps réel des indépendants</li>
            <li><code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>messages</code> — pour le chat en temps réel</li>
          </ul>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/">
            <button className="btn btn-primary">✅ C'est fait — Aller sur le site</button>
          </Link>
        </div>
      </div>
    </main>
  )
}
