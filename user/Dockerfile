FROM node:24-alpine
WORKDIR /app
COPY user/package*.json ./user/
WORKDIR /app/user
RUN npm install --omit=dev
WORKDIR /app
COPY user/ ./user/
WORKDIR /app/user
EXPOSE 5002
USER node
CMD ["npm", "start"]
