# Use an explicit builder image for dependencies and build
ARG NODE_VERSION=18.15.0
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source code and build the app
COPY . .
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
RUN npm run build

# Use a slim base image for the final stage
FROM nginx:alpine AS final

# Copy the built app to the nginx html directory
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Expose port 80 and use the default nginx command
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
