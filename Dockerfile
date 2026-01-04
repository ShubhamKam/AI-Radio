# Multi-stage Dockerfile for AI-Radio Development Container
# This Dockerfile supports both Node.js and Python development environments

# Stage 1: Base image with system dependencies
FROM ubuntu:22.04 AS base

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies and tools
RUN apt-get update && apt-get install -y \
    # Build essentials
    build-essential \
    gcc \
    g++ \
    make \
    cmake \
    pkg-config \
    # Version control
    git \
    # Network tools
    curl \
    wget \
    # Audio libraries (for audio processing if needed)
    libasound2-dev \
    libpulse-dev \
    # Python dependencies
    python3.11 \
    python3.11-dev \
    python3-pip \
    python3.11-venv \
    # Node.js dependencies
    ca-certificates \
    gnupg \
    lsb-release \
    # Text editors and utilities
    vim \
    nano \
    # Process management
    supervisor \
    # Cleanup
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Python packages manager
RUN pip3 install --upgrade pip setuptools wheel

# Stage 2: Development environment
FROM base AS development

# Set working directory
WORKDIR /workspace

# Set environment variables
ENV NODE_ENV=development
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Create non-root user for development
RUN useradd -m -s /bin/bash developer && \
    chown -R developer:developer /workspace

# Install global Node.js tools (if needed)
# RUN npm install -g nodemon pm2 typescript ts-node

# Install global Python tools (if needed)
# RUN pip3 install --user black flake8 pytest

# Copy package files (if they exist)
# COPY package*.json ./
# COPY requirements.txt ./

# Install dependencies (commented out until files exist)
# RUN npm install
# RUN pip3 install -r requirements.txt

# Copy application code
COPY . .

# Change ownership
RUN chown -R developer:developer /workspace

# Switch to non-root user
USER developer

# Expose common ports
# Frontend (adjust based on your stack)
EXPOSE 3000
# Backend API (adjust based on your stack)
EXPOSE 8000
# Audio streaming port (if needed)
EXPOSE 8080

# Default command (can be overridden in docker-compose)
CMD ["/bin/bash"]

# Stage 3: Production build (to be configured later)
FROM base AS production

WORKDIR /app

# Production setup will be added when ready
# COPY --from=development /workspace/dist ./dist
# COPY --from=development /workspace/node_modules ./node_modules

# CMD ["node", "server.js"]
