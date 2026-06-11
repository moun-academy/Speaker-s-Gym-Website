import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import { ThankYouCall, ThankYouPurchase } from './ThankYou.jsx'
import Privacy from './Privacy.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/thank-you-call" element={<ThankYouCall />} />
        <Route path="/thank-you-purchase" element={<ThankYouPurchase />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
