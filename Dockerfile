# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache postgresql-client wget && npm i -g sequelize-cli

COPY package.json package-lock.json* ./
ENV NODE_ENV=production
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY public ./public
COPY views ./views
COPY .sequelizerc ./

COPY src/config/sequelize-cli.cjs ./src/config/sequelize-cli.cjs
COPY src/db ./src/db

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
USER node
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["npm", "run", "start"]