FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
# Kept OUT of conf.d on purpose. 30-nginx-server-name.sh renders the live
# config from this template on every container start, so restarts always begin
# from a pristine source instead of editing yesterday's rendered config.
COPY nginx.conf /etc/nginx/mws-website-site.conf.template
COPY docker-entrypoint.d/ /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/*.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
