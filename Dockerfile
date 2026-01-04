FROM node:22-alpine

WORKDIR /app

# Install system dependencies if needed (e.g., for python or native modules)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY ai-radio/package.json ai-radio/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY ai-radio/ .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
