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
COPY --from=docker:latest /usr/local/bin/docker  /usr/local/bin/

RUN apt-get update && apt-get install -y git

RUN npx prisma generate

EXPOSE 8080

CMD npx prisma migrate deploy && node dist/index.mjs