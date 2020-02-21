FROM node:12.16-alpine3.9 as builder
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

FROM nginx:1.17.8 
COPY --from=builder /app/build /usr/share/nginx/html