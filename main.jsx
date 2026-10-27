import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import { ThankYouCall, ThankYouPurchase } from './ThankYou.jsx'
import Privacy from './Privacy.jsx'
import DeleteAccount from './DeleteAccount.jsx'
import BookACall from './BookACall.jsx'
import GroupCoaching from './GroupCoaching.jsx'
import MethodPage from './Method.jsx'
import KhadijaPortal from './KhadijaPortal.jsx'
import NadiraPortal from './NadiraPortal.jsx'
import PankajPortal from './PankajPortal.jsx'
import AshwinPortal from './AshwinPortal.jsx'
import MuhammadAshrafPortal from './MuhammadAshrafPortal.jsx'
import KiyanPortal from './KiyanPortal.jsx'
import { installCalendlyBookingTracking } from './metaTracking.js'

const PrivateSalesPage = lazy(() => import('./PrivateSales.jsx'))
const SalesPage = lazy(() => import('./Sales.jsx'))
const SalesAEDPage = lazy(() => import('./SalesAED.jsx'))

installCalendlyBookingTracking({ redirectTo: '/success' })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/book-a-call" element={<BookACall />} />
        <Route path="/group-coaching" element={<GroupCoaching />} />
        <Route path="/method" element={<MethodPage />} />
        <Route path="/sales" element={<Suspense fallback={null}><SalesPage /></Suspense>} />
        <Route path="/aed" element={<Suspense fallback={null}><SalesAEDPage /></Suspense>} />
        <Route path="/private/speakers-gym-program" element={<Suspense fallback={null}><PrivateSalesPage /></Suspense>} />
        <Route path="/khadija" element={<KhadijaPortal />} />
        <Route path="/nadira" element={<NadiraPortal />} />
        <Route path="/pankaj" element={<PankajPortal />} />
        <Route path="/ashwin" element={<AshwinPortal />} />
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
