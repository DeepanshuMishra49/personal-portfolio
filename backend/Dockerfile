# Production Node.js Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application files
COPY . .

# Expose default port
EXPOSE 8085

# Start Node.js server
CMD ["node", "server.js"]
