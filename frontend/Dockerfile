# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.15.0
ARG REACT_APP_BACKEND_URL

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

FROM base as deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM deps as build

# Set environment variable for React app
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build

FROM base as final
ENV NODE_ENV production

USER root
RUN npm install -g serve

USER node
COPY package.json .

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build ./build

EXPOSE 3000
CMD serve -s build
