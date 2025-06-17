FROM node:20.18.1-alpine As development

WORKDIR /usr/src/app

COPY package.json .

RUN yarn

COPY . .

RUN yarn build:proxy

FROM node:20.18.1-alpine As production

WORKDIR /proxy

COPY package.json .

COPY --from=development /usr/src/app/dist/proxy src

RUN yarn --production && yarn cache clean

CMD ["node", "src/main.js"]