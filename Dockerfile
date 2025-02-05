FROM node:lts as build

WORKDIR /usr/local/app

COPY ./package.json /usr/local/app/
COPY ./package-lock.json /usr/local/app/
COPY ./src /usr/local/app/src
COPY ./prisma /usr/local/app/prisma

RUN npm install
RUN npm run build

FROM node:lts

WORKDIR /usr/local/app
COPY --from=build /usr/local/app/node_modules /usr/local/app/node_modules
COPY --from=build /usr/local/app/dist /usr/local/app/dist
COPY --from=build /usr/local/app/prisma /usr/local/app/prisma

RUN apt-get update && apt-get install -y git

RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-25.0.3.tgz | tar xz --strip-components=1 -C /usr/local/bin/ \
    && mkdir -p /usr/local/lib/docker/cli-plugins \
    && curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/lib/docker/cli-plugins/docker-compose \
    && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

RUN npx prisma generate

EXPOSE 8080

CMD npx prisma migrate deploy && node dist/index.mjs