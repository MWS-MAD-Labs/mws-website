FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/hub-site.conf.template
COPY docker-entrypoint.d/ /docker-entrypoint.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]