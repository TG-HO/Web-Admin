FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Install dev dependencies for build
RUN npm ci

# Build stage
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy built application
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
