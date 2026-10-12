FROM node:24-alpine

# Set the working directory inside the container
WORKDIR /app
COPY user/package*.json ./user/
WORKDIR /app/user
RUN npm ci --omit=dev
COPY user/index.js user/dbconnect.js user/User.js ./
EXPOSE 5002
USER node
CMD ["npm", "start"]