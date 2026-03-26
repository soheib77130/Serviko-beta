import Link from 'next/link'
import { useState } from 'react'

export default function Header(){
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Link href="/"><img src="/logo.svg" alt="Serviko" className="logo"/></Link>
      </div>

      <nav className="nav">
        <div className="desktop-nav">
          <Link href="#categories" className="nav-link">Services</Link>
          <Link href="#comment" className="nav-link">Comment ça marche</Link>
          <Link href="#pourquoi" className="nav-link">Pourquoi</Link>
          <Link href="/signup"><button className="btn btn-primary">S'inscrire</button></Link>
        </div>

        <button className="hamburger" aria-label="menu" onClick={()=>setOpen(!open)}>☰</button>

        <div className={`mobile-menu ${open? 'open':''}`}>
          <Link href="#categories" onClick={()=>setOpen(false)}>Services</Link>
          <Link href="#comment" onClick={()=>setOpen(false)}>Comment ça marche</Link>
          <Link href="#pourquoi" onClick={()=>setOpen(false)}>Pourquoi</Link>
          <Link href="/signup" onClick={()=>setOpen(false)}><button className="btn btn-primary">S'inscrire</button></Link>
        </div>
      </nav>
    </header>
  )
}
