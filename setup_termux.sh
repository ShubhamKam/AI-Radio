#!/data/data/com.termux/files/usr/bin/bash

echo "Starting AI Radio Categorization Setup..."

# Update packages
echo "Updating package lists..."
pkg update -y && pkg upgrade -y

# Install dependencies
echo "Installing system dependencies..."
pkg install -y python git termux-api

# Install Python dependencies
echo "Installing Python libraries..."
pip install -r requirements.txt

# Create necessary directories
echo "Creating project directories..."
mkdir -p data/bookmarks
mkdir -p data/categorized_content
mkdir -p config
mkdir -p logs

echo "Setup complete! Please configure your API keys in config/config.json (to be created)."
