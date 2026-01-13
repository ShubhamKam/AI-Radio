# AI Radio Content Categorizer - Development Container
# This Dockerfile creates a development environment with all dependencies

FROM python:3.11-slim-bookworm

LABEL maintainer="AI Radio Team"
LABEL description="AI Radio Content Categorizer - Development Environment"
LABEL version="1.0.0"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build tools
    build-essential \
    gcc \
    g++ \
    make \
    pkg-config \
    # System libraries
    libxml2-dev \
    libxslt1-dev \
    libffi-dev \
    libssl-dev \
    libjpeg-dev \
    libpng-dev \
    zlib1g-dev \
    # Database
    sqlite3 \
    libsqlite3-dev \
    # Document processing
    antiword \
    poppler-utils \
    # Network tools
    curl \
    wget \
    # Version control
    git \
    # Utilities
    vim \
    nano \
    procps \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create app user and directories
RUN useradd -m -s /bin/bash appuser \
    && mkdir -p /app /data /config /logs \
    && chown -R appuser:appuser /app /data /config /logs

WORKDIR /app

# Copy requirements first for layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=appuser:appuser . .

# Make scripts executable
RUN chmod +x scripts/*.sh 2>/dev/null || true

# Set up volumes
VOLUME ["/data", "/config", "/logs"]

# Switch to non-root user
USER appuser

# Set default environment variables
ENV DATA_DIR=/data \
    CONFIG_DIR=/config \
    LOG_DIR=/logs \
    PYTHONPATH=/app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "from src.core.config import Config; Config()" || exit 1

# Default command
CMD ["python", "-m", "src.main", "--help"]
