FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL=""
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_GOOGLE_REDIRECT_URI=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_REDIRECT_URI=$VITE_GOOGLE_REDIRECT_URI

RUN bun run build

FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

RUN sed -i '/<script type="module"/i\    <script src="/env.js"></script>' /usr/share/nginx/html/index.html \
  && printf '%s\n' \
    'server {' \
    '  listen 80;' \
    '  server_name _;' \
    '  root /usr/share/nginx/html;' \
    '  index index.html;' \
    '' \
    '  location = /health {' \
    '    add_header Content-Type text/plain;' \
    '    return 200 "ok";' \
    '  }' \
    '' \
    '  location = /env.js {' \
    '    add_header Cache-Control "no-store";' \
    '    try_files /env.js =404;' \
    '  }' \
    '' \
    '  location / {' \
    '    try_files $uri $uri/ /index.html;' \
    '  }' \
    '}' \
    > /etc/nginx/conf.d/default.conf \
  && printf '%s\n' \
    '#!/bin/sh' \
    'set -eu' \
    'cat > /usr/share/nginx/html/env.js <<EOF_ENV' \
    'window.__MWS_ENV__ = {' \
    '  VITE_API_BASE_URL: "'"'"'${VITE_API_BASE_URL:-}'"'"'",' \
    '  VITE_GOOGLE_CLIENT_ID: "'"'"'${VITE_GOOGLE_CLIENT_ID:-}'"'"'",' \
    '  VITE_GOOGLE_REDIRECT_URI: "'"'"'${VITE_GOOGLE_REDIRECT_URI:-}'"'"'"' \
    '};' \
    'EOF_ENV' \
    > /docker-entrypoint.d/40-mws-runtime-env.sh \
  && chmod +x /docker-entrypoint.d/40-mws-runtime-env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
