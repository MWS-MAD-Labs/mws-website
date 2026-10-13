import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import './index.css'
import App from './App.tsx'
import { env } from '@/config/env'

const app = env.contactCaptchaEnabled && env.recaptchaSiteKey ? (
  <GoogleReCaptchaProvider
    reCaptchaKey={env.recaptchaSiteKey}
    scriptProps={{ async: true, defer: true, appendTo: 'head' }}
  >
    <App />
  </GoogleReCaptchaProvider>
) : (
  <App />
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {app}
  </StrictMode>,
)
