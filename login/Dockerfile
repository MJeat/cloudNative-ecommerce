FROM node:24-alpine

WORKDIR /app
COPY login/package*.json ./login/
WORKDIR /app/login
RUN npm ci --omit=dev
WORKDIR /app
COPY login/index.js login/dbconnect.js ./login/
COPY user/User.js ./user/User.js
WORKDIR /app/login
EXPOSE 5004
USER node
CMD ["npm", "start"]