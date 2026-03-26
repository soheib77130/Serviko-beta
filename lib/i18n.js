import { createContext, useContext, useState, useEffect } from 'react'

export const translations = {
  fr: {
    // Nav
    'nav.services': 'Services',
    'nav.how': 'Comment ça marche',
    'nav.why': 'Pourquoi',
    'nav.login': 'Se connecter',
    'nav.signup': "S'inscrire",
    'nav.dashboard': 'Tableau de bord',
    'nav.logout': 'Se déconnecter',

    // Landing
    'home.hero.title': "Serviko — l'indépendant, simplement.",
    'home.hero.subtitle': "Trouvez le bon profil en 2 minutes. Commandez, recevez, payez. 2% de commission, sans abonnement.",
    'home.cta.client': 'Déposer une demande',
    'home.cta.indep': 'Devenir indépendant',
    'home.how.title': 'Comment ça marche',
    'home.how.1': 'Déposez votre demande en 2 minutes',
    'home.how.2': "L'algorithme identifie les indépendants disponibles",
    'home.how.3': "L'indépendant accepte et vous contacte",
    'home.how.4': 'Payez en toute sécurité, recevez vos livrables',
    'home.why.title': 'Pourquoi Serviko ?',
    'home.why.1': '2% de commission seulement',
    'home.why.2': 'Pas abonnement, paiement à la mission',
    'home.why.3': 'Mise en relation en temps réel',
    'home.why.4': 'Messagerie et livrables intégrés',

    // Categories
    'cat.video': 'Vidéo & montage',
    'cat.web': 'Site web',
    'cat.design': 'Logo & design',
    'cat.writing': 'Rédaction',
    'cat.other': 'Autre',

    // Auth
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.fullname': 'Nom complet',
    'auth.login': 'Se connecter',
    'auth.signup': "S'inscrire",
    'auth.role.client': 'Je suis client',
    'auth.role.indep': 'Je suis indépendant',
    'auth.loading': 'Chargement...',
    'auth.no_account': "Pas encore de compte ?",
    'auth.has_account': 'Déjà un compte ?',
    'auth.categories.label': 'Mes catégories de services',
    'auth.success': "Inscription réussie ! Vérifie tes emails si confirmation requise.",

    // Dashboard client
    'client.dashboard.title': 'Mes demandes',
    'client.new_request': 'Nouvelle demande',
    'client.no_requests': 'Aucune demande pour le moment.',
    'client.missions.title': 'Mes missions actives',
    'client.no_missions': 'Aucune mission active.',
    'client.request.status.open': 'En attente de match',
    'client.request.status.matched': 'En cours',
    'client.request.status.closed': 'Terminée',
    'client.view_mission': 'Voir la mission',

    // Dashboard indep
    'indep.dashboard.title': 'Tableau de bord',
    'indep.status.online': 'En ligne',
    'indep.status.offline': 'Hors ligne',
    'indep.new_requests': 'Nouvelles demandes',
    'indep.my_missions': 'Mes missions',
    'indep.accept': 'Accepter',
    'indep.decline': 'Refuser',
    'indep.no_requests': 'Aucune nouvelle demande pour le moment.',
    'indep.no_missions': 'Aucune mission active.',
    'indep.categories_label': 'Mes catégories',
    'indep.edit_categories': 'Modifier mes catégories',
    'indep.save_categories': 'Enregistrer',

    // Request form
    'request.new.title': 'Nouvelle demande',
    'request.title_label': 'Titre de la mission',
    'request.category_label': 'Catégorie',
    'request.description_label': 'Description détaillée',
    'request.budget_min': 'Budget minimum (€)',
    'request.budget_max': 'Budget maximum (€)',
    'request.deadline_label': 'Délai souhaité',
    'request.deadline.7': '7 jours',
    'request.deadline.14': '14 jours',
    'request.deadline.month': '1 mois',
    'request.deadline.flexible': 'Flexible',
    'request.urgency_label': 'Urgence',
    'request.urgency.urgent': 'Urgent (dès que possible)',
    'request.urgency.normal': 'Normal',
    'request.urgency.flexible': 'Flexible',
    'request.collab_label': 'Mode de collaboration',
    'request.collab.chat': 'Échanges rapides (chat)',
    'request.collab.weekly': 'Points hebdomadaires',
    'request.collab.autonomous': 'Autonome (peu d\'échanges)',
    'request.submit': 'Envoyer la demande',
    'request.submitted': "Demande envoyée ! Nous cherchons les meilleurs profils disponibles.",
    'request.matched': '{n} indépendant(s) notifié(s).',

    // Mission page
    'mission.tab.messages': 'Messages',
    'mission.tab.deliverables': 'Livrables',
    'mission.tab.details': 'Détails',
    'mission.status.ongoing': 'En cours',
    'mission.status.delivered': 'Livrée',
    'mission.status.completed': 'Terminée',
    'mission.price_label': 'Prix convenu',
    'mission.commission_label': 'Commission (2%)',
    'mission.total_label': 'Total à payer',
    'mission.pay_btn': 'Payer maintenant (test)',
    'mission.pay_simulation': 'Simulation de paiement',
    'mission.paid_badge': 'Payée ✓',
    'mission.propose_price': 'Proposer un prix',
    'mission.price_input': 'Montant (€)',
    'mission.propose_btn': 'Proposer',
    'mission.send': 'Envoyer',
    'mission.msg_placeholder': 'Votre message...',
    'mission.no_messages': 'Aucun message. Commencez la conversation !',
    'mission.deliver_btn': 'Livrer les fichiers',
    'mission.delivered_note': 'Fichiers livrés au client.',
    'mission.complete_btn': 'Confirmer la réception',
    'mission.completed_msg': 'Mission terminée !',
    'mission.upload_label': 'Déposer les livrables',
    'mission.upload_btn': 'Choisir des fichiers',
    'mission.files_delivered': 'Fichiers livrés',
    'mission.no_files': 'Aucun livrable déposé.',
    'mission.client': 'Client',
    'mission.indep': 'Indépendant',
    'mission.request_details': 'Détails de la demande',

    // General
    'loading': 'Chargement...',
    'error': 'Une erreur est survenue.',
    'save': 'Enregistrer',
    'cancel': 'Annuler',
    'back': 'Retour',
    'see_details': 'Voir les détails',
    'confirm': 'Confirmer',
    'close': 'Fermer',
  },
  en: {
    // Nav
    'nav.services': 'Services',
    'nav.how': 'How it works',
    'nav.why': 'Why',
    'nav.login': 'Log in',
    'nav.signup': 'Sign up',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Log out',

    // Landing
    'home.hero.title': 'Serviko — freelancing, simply.',
    'home.hero.subtitle': 'Find the right freelancer in 2 minutes. Order, receive, pay. 2% commission, no subscription.',
    'home.cta.client': 'Post a request',
    'home.cta.indep': 'Become a freelancer',
    'home.how.title': 'How it works',
    'home.how.1': 'Post your request in 2 minutes',
    'home.how.2': 'The algorithm finds available freelancers',
    'home.how.3': 'The freelancer accepts and contacts you',
    'home.how.4': 'Pay securely, receive your deliverables',
    'home.why.title': 'Why Serviko?',
    'home.why.1': '2% commission only',
    'home.why.2': 'No subscription, pay per mission',
    'home.why.3': 'Real-time matching',
    'home.why.4': 'Integrated messaging and deliverables',

    // Categories
    'cat.video': 'Video & editing',
    'cat.web': 'Website',
    'cat.design': 'Logo & design',
    'cat.writing': 'Writing',
    'cat.other': 'Other',

    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullname': 'Full name',
    'auth.login': 'Log in',
    'auth.signup': 'Sign up',
    'auth.role.client': 'I am a client',
    'auth.role.indep': 'I am a freelancer',
    'auth.loading': 'Loading...',
    'auth.no_account': 'No account yet?',
    'auth.has_account': 'Already have an account?',
    'auth.categories.label': 'My service categories',
    'auth.success': 'Registration successful! Check your emails if confirmation is required.',

    // Dashboard client
    'client.dashboard.title': 'My requests',
    'client.new_request': 'New request',
    'client.no_requests': 'No requests yet.',
    'client.missions.title': 'My active missions',
    'client.no_missions': 'No active missions.',
    'client.request.status.open': 'Pending match',
    'client.request.status.matched': 'In progress',
    'client.request.status.closed': 'Completed',
    'client.view_mission': 'View mission',

    // Dashboard indep
    'indep.dashboard.title': 'Dashboard',
    'indep.status.online': 'Online',
    'indep.status.offline': 'Offline',
    'indep.new_requests': 'New requests',
    'indep.my_missions': 'My missions',
    'indep.accept': 'Accept',
    'indep.decline': 'Decline',
    'indep.no_requests': 'No new requests for now.',
    'indep.no_missions': 'No active missions.',
    'indep.categories_label': 'My categories',
    'indep.edit_categories': 'Edit my categories',
    'indep.save_categories': 'Save',

    // Request form
    'request.new.title': 'New request',
    'request.title_label': 'Mission title',
    'request.category_label': 'Category',
    'request.description_label': 'Detailed description',
    'request.budget_min': 'Minimum budget (€)',
    'request.budget_max': 'Maximum budget (€)',
    'request.deadline_label': 'Desired deadline',
    'request.deadline.7': '7 days',
    'request.deadline.14': '14 days',
    'request.deadline.month': '1 month',
    'request.deadline.flexible': 'Flexible',
    'request.urgency_label': 'Urgency',
    'request.urgency.urgent': 'Urgent (ASAP)',
    'request.urgency.normal': 'Normal',
    'request.urgency.flexible': 'Flexible',
    'request.collab_label': 'Collaboration mode',
    'request.collab.chat': 'Quick exchanges (chat)',
    'request.collab.weekly': 'Weekly check-ins',
    'request.collab.autonomous': 'Autonomous (minimal exchanges)',
    'request.submit': 'Submit request',
    'request.submitted': "Request submitted! We're finding the best available profiles.",
    'request.matched': '{n} freelancer(s) notified.',

    // Mission page
    'mission.tab.messages': 'Messages',
    'mission.tab.deliverables': 'Deliverables',
    'mission.tab.details': 'Details',
    'mission.status.ongoing': 'Ongoing',
    'mission.status.delivered': 'Delivered',
    'mission.status.completed': 'Completed',
    'mission.price_label': 'Agreed price',
    'mission.commission_label': 'Commission (2%)',
    'mission.total_label': 'Total to pay',
    'mission.pay_btn': 'Pay now (test)',
    'mission.pay_simulation': 'Payment simulation',
    'mission.paid_badge': 'Paid ✓',
    'mission.propose_price': 'Propose a price',
    'mission.price_input': 'Amount (€)',
    'mission.propose_btn': 'Propose',
    'mission.send': 'Send',
    'mission.msg_placeholder': 'Your message...',
    'mission.no_messages': 'No messages. Start the conversation!',
    'mission.deliver_btn': 'Deliver files',
    'mission.delivered_note': 'Files delivered to client.',
    'mission.complete_btn': 'Confirm receipt',
    'mission.completed_msg': 'Mission completed!',
    'mission.upload_label': 'Upload deliverables',
    'mission.upload_btn': 'Choose files',
    'mission.files_delivered': 'Delivered files',
    'mission.no_files': 'No deliverables yet.',
    'mission.client': 'Client',
    'mission.indep': 'Freelancer',
    'mission.request_details': 'Request details',

    // General
    'loading': 'Loading...',
    'error': 'An error occurred.',
    'save': 'Save',
    'cancel': 'Cancel',
    'back': 'Back',
    'see_details': 'See details',
    'confirm': 'Confirm',
    'close': 'Close',
  }
}

const I18nContext = createContext({ lang: 'fr', t: (k) => k, setLang: () => {} })

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('fr')

  useEffect(() => {
    const saved = localStorage.getItem('serviko_lang')
    if (saved === 'fr' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = (l) => {
    setLangState(l)
    localStorage.setItem('serviko_lang', l)
  }

  const t = (key, vars = {}) => {
    let str = translations[lang][key] || translations['fr'][key] || key
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v)
    })
    return str
  }

  return <I18nContext.Provider value={{ lang, t, setLang }}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
