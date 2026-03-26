import Link from 'next/link'
import { useState } from 'react'

export default function Header(){
  const [open, setOpen] = useState(false)
  return (
    <header style={{padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Link href="/"><img src="/logo.svg" alt="Serviko" style={{height:40}}/></Link>
      </div>
      <nav>
        <div className="desktop-nav" style={{display:'flex',gap:14,alignItems:'center'}}>
          <Link href="#categories" style={{color:'var(--muted)'}}>Services</Link>
          <Link href="#comment" style={{color:'var(--muted)'}}>Comment ça marche</Link>
          <Link href="#pourquoi" style={{color:'var(--muted)'}}>Pourquoi</Link>
          <Link href="/signup"><button className="btn btn-primary">S'inscrire</button></Link>
        </div>
        <button className="btn btn-ghost" style={{display:'none'}} onClick={()=>setOpen(!open)}>☰</button>
      </nav>
    </header>
  )
}
