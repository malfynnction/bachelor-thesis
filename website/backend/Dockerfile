FROM node:12.16-alpine3.9 as builder
WORKDIR /app

# copy package.json first to avoid unnecessary npm install
COPY package.json /app 
RUN npm install

COPY . /app
ENTRYPOINT ["node", "/app/server.js" ]

EXPOSE 8080
