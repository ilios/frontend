FROM node:carbon

MAINTAINER Ilios Project Team <support@iliosproject.org>

WORKDIR /web
ENV PATH=/web/node_modules/.bin:$PATH
COPY . /web

RUN yarn install

CMD ["yarn", "start"]
EXPOSE 4200
