FROM node:12.16-alpine3.9 as builder
WORKDIR /app

# copy package.json first to avoid unnecessary npm install
COPY package.json /app 
RUN npm install

COPY src /app/src
COPY public /app/public
RUN npm run build

FROM nginx:1.17.9-alpine 
COPY --from=builder /app/build /var/www/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80