FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . ./

RUN yarn build

FROM node:24-alpine AS runtime

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["yarn", "start"]


