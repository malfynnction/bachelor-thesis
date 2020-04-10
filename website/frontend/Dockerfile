FROM node:12.16-alpine3.9 as builder
WORKDIR /app
COPY . /app
COPY ../package.json /app/package.json
RUN npm install
RUN npm run build

FROM nginx:1.17.9-alpine 
COPY --from=builder /app/build /var/www/html
COPY nginx-frontend.conf /etc/nginx/nginx.conf