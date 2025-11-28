FROM node:20-alpine AS base

# 1. Dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 2. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Garante que o Prisma usado no build seja o 5.22.0
RUN npm install prisma@5.22.0 --save-dev
RUN npx prisma generate
RUN npm run build

# 3. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Define o HOME para o diretório de trabalho
ENV HOME=/app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Instala OpenSSL
RUN apk add --no-cache openssl

# --- CORREÇÃO DO ERRO PRISMA 7 E PERMISSÕES ---
# Instalamos o Prisma 5.22.0 E O TSX globalmente
# tsx é necessário para rodar o seed.ts em produção
RUN npm install -g prisma@5.22.0 tsx && \
    chown -R nextjs:nodejs /usr/local/lib/node_modules
# ----------------------------------------------

# Copia arquivos e dá permissões
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

RUN mkdir -p public/uploads && chown nextjs:nodejs public/uploads
RUN mkdir .next
RUN chown nextjs:nodejs .next

# --- CORREÇÃO DO ERRO EPERM (CACHE) ---
# Cria a pasta de cache e dá permissão ao usuário nextjs
RUN mkdir -p .cache && chown -R nextjs:nodejs .cache
# --------------------------------------

# Copia o build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando de inicialização
# ADICIONADO: --skip-generate para não quebrar em produção
CMD npx prisma db push --skip-generate && npx prisma db seed && node server.js