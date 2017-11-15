FROM node:boron-alpine

MAINTAINER Ilios Project Team <support@iliosproject.org>

RUN apk add --update git
RUN rm -rf /var/cache/apk/* && rm -rf /tmp/*

WORKDIR /web
ENV PATH=/web/node_modules/.bin:$PATH
COPY . /web

RUN npm install

CMD ["ember", "serve"]
EXPOSE 4200
