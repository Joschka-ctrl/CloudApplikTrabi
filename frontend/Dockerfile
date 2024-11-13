# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.15.0
ARG REACT_APP_BACKEND_URL



FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM deps AS build

# Set environment variable for React app
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}


ARG AUTH_API_KEY
ENV AUTH_API_KEY=${AUTH_API_KEY}

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build

FROM base AS final
ENV NODE_ENV=production

USER root
RUN npm install -g serve

USER node
COPY package.json .

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build ./build

EXPOSE 3000
CMD ["serve", "-s", "build"]
