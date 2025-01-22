# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# Production stage
FROM node:18-alpine

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy built node modules and other files from builder
COPY --from=builder /app ./

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3023

CMD ["node", "server.js"]
