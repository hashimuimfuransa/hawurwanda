# Dockerfile for HAWU Rwanda 2.0 Server (Optimized)
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# --- Production stage ---
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled JS files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["npm", "start"]
