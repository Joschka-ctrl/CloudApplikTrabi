# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_BACKEND_URL
ARG VITE_AUTH_API_KEY

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve package
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist .

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Start the server
CMD ["serve", "-s", ".", "-l", "8080"]
