FROM node:20-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install global tools
RUN npm install -g @ionic/cli @nestjs/cli @capacitor/cli ts-node typescript

# Set working directory
WORKDIR /workspace

# Copy project files (will be mounted in dev, but good for build)
COPY . .

# Expose ports
# Frontend: 8100 (Ionic), 5173 (Vite)
# Backend: 3000
EXPOSE 8100 5173 3000

# Default command
CMD ["bash"]
