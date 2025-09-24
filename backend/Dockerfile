# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci
RUN npm run prisma:generate

FROM deps AS build
COPY tsconfig.json ./
COPY vitest.config.ts ./
COPY src ./src
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY package.json ./package.json
ENV PORT=3010
EXPOSE 3010
CMD ["node", "dist/server.js"]