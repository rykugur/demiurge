# Build stage
FROM oven/bun:1.0 as builder

WORKDIR /app

# Copy package files
COPY package.json ./
RUN bun install

# Copy source
COPY . .

# Build Next.js app
RUN bun run build

# Production stage
FROM oven/bun:1.0-slim

WORKDIR /app

# Install git for isomorphic-git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create data directories
RUN mkdir -p /data/workspaces /data/directives

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Run the server
CMD ["bun", "run", "server"]
