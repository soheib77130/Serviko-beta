import Link from 'next/link'

export default function Home(){
  return (
    <main className="container">
      <section className="hero">
        <div className="hero-left">
          <h1 className="h1">Serviko — indépendant, simplement</h1>
          <p className="lead">Trouvez un indépendant qualifié en 2 minutes. Transparence, 2% de commission, pas d'abonnement.</p>
          <div className="cta-row">
            <Link href="/signup"><button className="btn btn-primary">Publier une demande</button></Link>
            <Link href="/signup"><button className="btn btn-ghost">Devenir indépendant</button></Link>
          </div>
          <p className="small">Exemples : site web, montage vidéo, logo, rédaction, marketing — paiement sécurisé & gestion des livrables.</p>
        </div>
        <div className="card">
          <strong>Recherche rapide</strong>
          <p className="small">Choisis une catégorie pour voir des indépendants disponibles.</p>
        </div>
      </section>

      <section style={{marginTop:24}}>
        <div className="card">
          <h3 style={{margin:'0 0 8px'}}>Pourquoi Serviko ?</h3>
          <ul className="small">
            <li>Commission réduite : 2%</li>
            <li>Pas d’abonnement, paiement à la mission</li>
            <li>Interface simple pour déposer et gérer des demandes</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
