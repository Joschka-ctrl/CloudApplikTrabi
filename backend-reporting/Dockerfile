# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.15.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV=production

ARG BUCKET_ENV
ENV BUCKET_ENV=${BUCKET_ENV}

WORKDIR /usr/src/app

# Create app directory and ensure correct permissions
RUN mkdir -p /home/node/.npm && \
    chown -R node:node /usr/src/app /home/node/.npm

# Switch to non-root user
USER node

# Copy package files first
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the source files into the image
COPY --chown=node:node . .

# Expose the port that the application listens on
EXPOSE 3004

# Run the application
CMD ["node", "src/server.js"]
