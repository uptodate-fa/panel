FROM node:20.18.0-alpine As development

WORKDIR /usr/src/app

COPY package.json .

RUN yarn

COPY . .

RUN yarn build:panel

FROM nginx:alpine As production

RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d

COPY --from=development /usr/src/app/dist/panel /usr/share/nginx/html

EXPOSE 80