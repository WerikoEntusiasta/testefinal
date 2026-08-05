# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for native C++ modules (sqlite3)
RUN apk add --no-cache python3 make g++ gcc

# Copy package manifests and install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy full application source code
COPY . .

# Build frontend (Vite) and bundle backend server (esbuild)
RUN npm run build

# Stage 2: Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install build dependencies, install production packages, rebuild native binaries, clean cache
COPY package*.json ./
RUN apk add --no-cache python3 make g++ gcc && \
    npm ci --only=production && \
    npm rebuild sqlite3 && \
    apk del python3 make g++ gcc && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create volume directories for persistent data
RUN mkdir -p /app/uploads /app/data

EXPOSE 3000 80 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "dist/server.cjs"]

