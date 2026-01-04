# Multi-stage Dockerfile for AI Radio App
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg \
    imagemagick \
    curl \
    git \
    bash

WORKDIR /app

# Backend stage
FROM base AS backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production
COPY backend/ ./
EXPOSE 3001
CMD ["npm", "start"]

# Frontend stage
FROM base AS frontend
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm install -g concurrently
COPY . .
RUN cd backend && npm install
RUN cd frontend && npm install
EXPOSE 3000 3001
CMD ["npm", "run", "dev"]
