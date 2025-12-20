FROM node:20.18.1-alpine As development

WORKDIR /usr/src/app

COPY package.json .

RUN yarn

COPY . .

RUN yarn nx run drug-interaction:build --skip-nx-cache --verbose --no-cloud

FROM nginx:alpine As production

RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d

COPY --from=development /usr/src/app/dist/drug-interaction /usr/share/nginx/html

EXPOSE 80

