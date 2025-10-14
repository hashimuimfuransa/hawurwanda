# Dockerfile for HAWU Rwanda 2.0 Server
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies (no lockfile required)
RUN npm install --omit=dev

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
