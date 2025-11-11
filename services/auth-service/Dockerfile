FROM node:25-alpine AS builder

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . ./

RUN yarn build

FROM node:25-alpine

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "yarn start"]
