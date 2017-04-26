FROM node:boron-alpine

MAINTAINER Ilios Project Team <support@iliosproject.org>

RUN apk add --update git
RUN rm -rf /var/cache/apk/* && rm -rf /tmp/*
RUN npm install --global bower

WORKDIR /web
ENV PATH=/web/node_modules/.bin:$PATH
COPY . /web

RUN yarn install && bower install --allow-root

CMD ["ember", "serve"]
EXPOSE 4200
