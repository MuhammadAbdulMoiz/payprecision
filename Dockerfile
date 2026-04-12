# ─── Stage 1: Build the React frontend ────────────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

# Install server dependencies only
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/dist ./dist

# Create the db directory structure that will be volume-mounted
RUN mkdir -p /db/images

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/db

CMD ["node", "server/index.js"]
