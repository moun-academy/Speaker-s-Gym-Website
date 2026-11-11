import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import { ThankYouCall, ThankYouPurchase } from './ThankYou.jsx'
import Privacy from './Privacy.jsx'
import DeleteAccount from './DeleteAccount.jsx'
import BookACall from './BookACall.jsx'
import GroupCoaching from './GroupCoaching.jsx'
import KhadijaPortal from './KhadijaPortal.jsx'
import NadiraPortal from './NadiraPortal.jsx'
import PankajPortal from './PankajPortal.jsx'
import AshwinPortal from './AshwinPortal.jsx'
import NezhouPortal from './NezhouPortal.jsx'
import MuhammadAshrafPortal from './MuhammadAshrafPortal.jsx'
import KiyanPortal from './KiyanPortal.jsx'
import { installCalendlyBookingTracking } from './metaTracking.js'

const SalesPage = lazy(() => import('./Sales.jsx'))
const SalesUAEPage = lazy(() => import('./SalesUAE.jsx'))
const SalesEuropePage = lazy(() => import('./SalesEurope.jsx'))
const CorporatePage = lazy(() => import('./Corporate.jsx'))
const ZlinPage = lazy(() => import('./Zlin.jsx'))
const SalesQatarPage = lazy(() => import('./SalesQatar.jsx'))

installCalendlyBookingTracking({ redirectTo: '/success' })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/book-a-call" element={<BookACall />} />
        <Route path="/group-coaching" element={<GroupCoaching />} />
        {/* The /method page was removed; send old links to the homepage */}
        <Route path="/method" element={<Navigate to="/" replace />} />
        <Route path="/sales" element={<Suspense fallback={null}><SalesPage /></Suspense>} />
        <Route path="/uae" element={<Suspense fallback={null}><SalesUAEPage /></Suspense>} />
        {/* Old address, redirected so any shared /aed links keep working */}
        <Route path="/aed" element={<Navigate to="/uae" replace />} />
        <Route path="/europe" element={<Suspense fallback={null}><SalesEuropePage /></Suspense>} />
        <Route path="/qatar" element={<Suspense fallback={null}><SalesQatarPage /></Suspense>} />
        <Route path="/zlin" element={<Suspense fallback={null}><ZlinPage /></Suspense>} />
        <Route path="/corporate" element={<Suspense fallback={null}><CorporatePage /></Suspense>} />
        {/* The private presentation was removed; send old links to the homepage */}
        <Route path="/private/speakers-gym-program" element={<Navigate to="/" replace />} />
        <Route path="/khadija" element={<KhadijaPortal />} />
        <Route path="/nadira" element={<NadiraPortal />} />
        <Route path="/pankaj" element={<PankajPortal />} />
        <Route path="/ashwin" element={<AshwinPortal />} />
        <Route path="/nezhou" element={<NezhouPortal />} />
        <Route path="/muhammad-ashraf" element={<MuhammadAshrafPortal />} />
        <Route path="/kiyan" element={<KiyanPortal />} />
        <Route path="/success" element={<ThankYouCall />} />
        {/* Old booking success URL, redirected so existing links keep working */}
        <Route path="/thank-you-call" element={<Navigate to="/success" replace />} />
        <Route path="/thank-you-purchase" element={<ThankYouPurchase />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
