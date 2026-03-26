import Link from 'next/link'
import { useI18n } from '../lib/i18n'

const CATEGORIES = [
  { key: 'video', icon: '🎬', slug: 'video' },
  { key: 'web', icon: '💻', slug: 'web' },
  { key: 'design', icon: '🎨', slug: 'design' },
  { key: 'writing', icon: '✍️', slug: 'writing' },
  { key: 'other', icon: '⚡', slug: 'other' },
]

export default function Home() {
  const { t } = useI18n()

  return (
    <main className="page">
      <div className="container">
        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-left">
            <h1 className="h1">
              <span>{t('home.hero.title').split('—')[0]}</span>
              {t('home.hero.title').includes('—') && (
                <>— {t('home.hero.title').split('—')[1]}</>
              )}
            </h1>
            <p className="lead">{t('home.hero.subtitle')}</p>
            <div className="cta-row">
              <Link href="/signup?role=client">
                <button className="btn btn-primary">{t('home.cta.client')}</button>
              </Link>
              <Link href="/signup?role=independent">
                <button className="btn btn-ghost">{t('home.cta.indep')}</button>
              </Link>
            </div>
          </div>
          <div className="hero-right">
            <div className="card" style={{ padding: 28 }}>
              <p className="section-label" style={{ marginBottom: 16 }}>Serviko</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '⚡', label: t('home.how.1') },
                  { icon: '🤝', label: t('home.how.3') },
                  { icon: '💳', label: t('home.how.4') },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <span style={{ fontSize: 14, color: 'var(--text2)' }}>{item.label}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                  <span className="badge badge-accepted">2% commission</span>
                  <span style={{ marginLeft: 8 }} className="small">seulement</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="section" id="categories">
          <h2 className="section-title">{t('home.how.title')}</h2>
          <div className="cats-section" style={{ marginBottom: 48 }}>
            {CATEGORIES.map(c => (
              <Link key={c.key} href={`/signup?role=client&category=${c.slug}`} className="cat-card">
                <div className="cat-icon">{c.icon}</div>
                <div className="cat-name">{t(`cat.${c.key}`)}</div>
              </Link>
            ))}
          </div>

          <div className="steps-grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card step-card">
                <div className="step-num">{n}</div>
                <h4>{t(`home.how.${n}`)}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY ── */}
        <section className="section" id="pourquoi">
          <h2 className="section-title">{t('home.why.title')}</h2>
          <div className="why-grid">
            {[
              { icon: '💰', key: 1 },
              { icon: '🚀', key: 2 },
              { icon: '⚡', key: 3 },
              { icon: '📦', key: 4 },
            ].map(item => (
              <div key={item.key} className="why-card">
                <span className="why-icon">{item.icon}</span>
                <div>
                  <h4>{t(`home.why.${item.key}`)}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section style={{ textAlign: 'center', padding: '48px 0' }} id="comment">
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>{t('home.cta.client')}</h2>
          <p className="text-muted" style={{ marginBottom: 24, fontSize: 15 }}>{t('home.hero.subtitle')}</p>
          <Link href="/signup">
            <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
              {t('nav.signup')}
            </button>
          </Link>
        </section>
      </div>
    </main>
  )
}
