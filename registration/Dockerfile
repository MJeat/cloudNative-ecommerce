FROM node:24-alpine

WORKDIR /app
COPY registration/package*.json ./registration/
WORKDIR /app/registration
RUN npm ci --omit=dev
WORKDIR /app
COPY registration/index.js registration/dbconnect.js ./registration/
COPY user/User.js ./user/User.js
WORKDIR /app/registration
EXPOSE 5003
USER node
CMD ["npm", "start"]