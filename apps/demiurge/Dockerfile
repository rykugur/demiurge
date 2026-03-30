# Build stage with all dependencies
FROM oven/bun:1.0

WORKDIR /app

# Install git and curl for isomorphic-git and healthcheck
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./
RUN bun install

# Copy source code
COPY . .

# Build Next.js app (for the dashboard)
RUN bun run build

# Create data directories
RUN mkdir -p /data/workspaces /data/directives .data

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Run the orchestrator server
CMD ["bun", "run", "server"]
