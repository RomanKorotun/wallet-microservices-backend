FROM node:20-alpine AS base
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . ./

# Лінт
FROM base AS lint
CMD ["yarn", "lint"]

# Юніт-тести
FROM base AS unit
CMD ["yarn", "test"]

# E2E-тести
FROM base AS e2e
ENV NODE_ENV=test
CMD ["yarn", "test:e2e"]

# Development
FROM base AS development 
RUN npx prisma generate 
ENV NODE_ENV=development 
EXPOSE 3000 
CMD ["sh", "-c", "npx prisma migrate deploy && yarn dev"]

# Deploy
FROM base AS deploy
RUN npx prisma generate
CMD ["sh", "-c", "npx prisma migrate deploy"]

# Build
FROM base AS build 
RUN npx prisma generate 
RUN yarn build

#  Production
FROM node:20-alpine AS production
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
ENV NODE_ENV=production
EXPOSE 3000
CMD ["yarn", "start"]
