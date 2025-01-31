# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=18.15.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

ARG BUCKET_ENV
ENV BUCKET_ENV=${BUCKET_ENV}

ARG CLUSTER_NAME
ENV CLUSTER_NAME=${CLUSTER_NAME}

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Run the application as a non-root user.
USER root

# Copy the rest of the source files into the image.
COPY . .

# Change ownership of the app files to the 'node' user.
RUN chown -R node:node /usr/src/app

# Switch to the 'node' user.
USER node

# Expose the port that the application listens on.
EXPOSE 3015

# Run the application.
CMD node src/server.js
