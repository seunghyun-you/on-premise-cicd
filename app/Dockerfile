# IMAGE BUILD
FROM node:22 AS BUILD_IMAGE
WORKDIR /app
COPY . .
RUN npm install

# APP RUNNING
FROM gcr.io/distroless/nodejs22
WORKDIR /app

COPY --from=BUILD_IMAGE /app/app.js ./app.js
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

ENTRYPOINT ["app.js"]