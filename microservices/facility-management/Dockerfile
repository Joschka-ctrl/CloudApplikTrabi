ARG NODE_VERSION=18.15.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV=production

ARG AUTH_API_KEY
ENV AUTH_API_KEY=${AUTH_API_KEY}

ARG PROJECT_ID
ENV PROJECT_ID=${PROJECT_ID}

WORKDIR /usr/src/app

# Create app directory and ensure correct permissions
RUN mkdir -p /home/node/.npm && \
    chown -R node:node /usr/src/app /home/node/.npm

# Switch to non-root user
USER node

# Copy package files first
COPY --chown=node:node package*.json ./

# Install dependencies
RUN if [ -f package-lock.json ]; then \
        npm ci --omit=dev; \
    else \
        npm install --omit=dev; \
    fi

# Copy the rest of the source files into the image
COPY --chown=node:node . .

# Expose the port that the application listens on
EXPOSE 3021

# Run the application
CMD ["node", "src/server.js"]