FROM node:25-alpine AS builder

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . ./

RUN yarn build

FROM node:25-alpine AS runtime

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/dist ./dist

RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 3000

CMD ["yarn", "start"]


