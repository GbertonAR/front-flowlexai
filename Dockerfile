# =======================================================
# SISTEMA: FlowState AI - Inteligencia Conectada
# IMAGEN:  flowlexai-frontend:latest
# AUTOR:   Gustavo Berton
# FECHA:   2026-06-01
# =======================================================

# -- Stage 1: Build React + Vite -----------------------
FROM node:22-slim AS builder
WORKDIR /app
RUN npm install -g pnpm@latest
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts && \
    pnpm rebuild esbuild
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm build

# -- Stage 2: Serve con nginx --------------------------
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/nginx.conf.template
RUN rm -f /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]