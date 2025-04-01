FROM oven/bun AS packages

WORKDIR /app

COPY bun.lock .
COPY package.json .

RUN bun install --frozen-lockfile

FROM packages AS build

COPY src ./src

RUN bun build ./src/index.ts --compile --outfile server

FROM packages AS database

WORKDIR /app

COPY migrations ./migrations
COPY src/env.ts ./src/env.ts
COPY drizzle.config.ts ./drizzle.config.ts

ENV DATABASE_URL=/app/db.sqlite

RUN bunx drizzle-kit migrate

FROM ubuntu:22.04

WORKDIR /app

COPY --from=build /app/server /app/server
COPY --from=database /app/db.sqlite /app/db.sqlite

ENV TZ=America/Indiana/Indianapolis
ENV DATABASE_URL=/app/db.sqlite

EXPOSE 3001

CMD ["/app/server"]
