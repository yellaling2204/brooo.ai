FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm@12.10.1

WORKDIR /app

# Copy root monorepo files
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install dependencies
RUN pnpm install --filter @brooo/api...

# Build api
RUN pnpm --filter @brooo/api build

EXPOSE 4000

CMD ["pnpm", "--filter", "@brooo/api", "start"]

