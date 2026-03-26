import '../styles/globals.css'
import Header from '../components/Header'
import { I18nProvider } from '../lib/i18n'

export default function App({ Component, pageProps }) {
  return (
    <I18nProvider>
      <Header />
      <Component {...pageProps} />
    </I18nProvider>
  )
}
