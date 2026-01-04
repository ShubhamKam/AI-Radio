# Backend Dockerfile
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Install system dependencies
RUN apk add --no-cache python3 make g++ ffmpeg

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Build TypeScript
RUN npm run build

# Frontend Dockerfile stage
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Production image
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    postgresql-client \
    redis

WORKDIR /app

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/backend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/server.js"]
