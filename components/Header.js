import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { useI18n } from '../lib/i18n'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const router = useRouter()
  const { lang, t, setLang } = useI18n()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(id) {
    const { data } = await supabase.from('profiles').select('full_name,role').eq('id', id).single()
    setProfile(data)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
  }

  const dashboardHref = profile?.role === 'independent' ? '/indep/dashboard' : '/dashboard'

  return (
    <header className="site-header">
      <div className="flex-gap">
        <Link href="/">
          <img src="/logo.svg" alt="Serviko" className="logo" onError={e => { e.target.style.display='none' }} />
        </Link>
        <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent)', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          Serviko
        </Link>
      </div>

      <nav className="nav">
        <div className="desktop-nav">
          <Link href="/#comment" className="nav-link">{t('nav.how')}</Link>
          <Link href="/#pourquoi" className="nav-link">{t('nav.why')}</Link>

          <button
            className="lang-btn"
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            title="Change language"
          >
            {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>

          {user ? (
            <>
              <Link href={dashboardHref} className="nav-link">{t('nav.dashboard')}</Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">{t('nav.login')}</Link>
              <Link href="/signup"><button className="btn btn-primary btn-sm">{t('nav.signup')}</button></Link>
            </>
          )}
        </div>

        <button className="hamburger" aria-label="menu" onClick={() => setOpen(!open)}>☰</button>

        <div className={`mobile-menu ${open ? 'open' : ''}`}>
          <Link href="/#comment" className="nav-link" onClick={() => setOpen(false)}>{t('nav.how')}</Link>
          <Link href="/#pourquoi" className="nav-link" onClick={() => setOpen(false)}>{t('nav.why')}</Link>
          <button
            className="lang-btn"
            style={{ marginTop: 4 }}
            onClick={() => { setLang(lang === 'fr' ? 'en' : 'fr'); setOpen(false) }}
          >
            {lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
          </button>
          {user ? (
            <>
              <Link href={dashboardHref} onClick={() => setOpen(false)} className="nav-link">{t('nav.dashboard')}</Link>
              <button className="btn btn-ghost btn-sm btn-full" style={{ marginTop: 8 }} onClick={handleLogout}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="nav-link">{t('nav.login')}</Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <button className="btn btn-primary btn-sm btn-full" style={{ marginTop: 8 }}>{t('nav.signup')}</button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
