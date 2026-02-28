FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3200
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# Entrypoint fixes volume permissions then drops to nextjs user
RUN printf '#!/bin/sh\nchown -R nextjs:nodejs /app/uploads 2>/dev/null || true\nexec su-exec nextjs node server.js\n' > /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh \
    && apk add --no-cache su-exec

EXPOSE 3200
CMD ["/app/entrypoint.sh"]
