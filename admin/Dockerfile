FROM node:24-alpine

WORKDIR /app
WORKDIR /app
COPY admin/package*.json ./admin/
WORKDIR /app/admin
RUN npm ci --omit=dev
WORKDIR /app
COPY admin/index.js admin/dbconnect.js ./admin/
COPY user/User.js ./user/User.js
WORKDIR /app/admin
EXPOSE 5001
USER node
CMD ["npm", "start"]
