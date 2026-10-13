#!/bin/sh
set -eu

# Vite bakes VITE_* at build time, which would tie one image to one
# environment. This writes runtime config at container start instead.
js_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e "s/'/\\'/g"
}

runtime_api_base_url="${VITE_API_BASE_URL:-${API_BASE_URL:-}}"
runtime_google_client_id="${VITE_GOOGLE_CLIENT_ID:-${GOOGLE_CLIENT_ID:-}}"
runtime_google_redirect_uri="${VITE_GOOGLE_REDIRECT_URI:-${GOOGLE_REDIRECT_URI:-}}"
runtime_contact_captcha_enabled="${VITE_CONTACT_CAPTCHA_ENABLED:-${CONTACT_CAPTCHA_ENABLED:-false}}"
runtime_recaptcha_site_key="${VITE_RECAPTCHA_SITE_KEY:-${RECAPTCHA_SITE_KEY:-}}"

cat > /usr/share/nginx/html/env.js <<INNER
window.__MWS_ENV__ = {
  VITE_API_BASE_URL: '$(js_escape "$runtime_api_base_url")',
  VITE_GOOGLE_CLIENT_ID: '$(js_escape "$runtime_google_client_id")',
  VITE_GOOGLE_REDIRECT_URI: '$(js_escape "$runtime_google_redirect_uri")',
  VITE_CONTACT_CAPTCHA_ENABLED: '$(js_escape "$runtime_contact_captcha_enabled")',
  VITE_RECAPTCHA_SITE_KEY: '$(js_escape "$runtime_recaptcha_site_key")',
};
INNER
