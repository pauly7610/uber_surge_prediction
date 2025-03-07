#!/bin/bash

# Install dependencies with legacy peer deps
npm install --legacy-peer-deps

# Build the application
npm run build

# Output success message
echo "Build completed successfully!" 