FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code and public assets
COPY server.js ./
COPY public ./public
COPY dist ./dist

EXPOSE 8085

ENV PORT=8085
ENV NODE_ENV=production

CMD ["node", "server.js"]
