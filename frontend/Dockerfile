# Frontend Dockerfile
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY frontend/package*.json ./
COPY frontend/tsconfig.json ./
# COPY frontend/next.config.ts ./
# Copy other necessary files if any

RUN npm install

# Copy backend schema and generate client
COPY backend/prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

COPY frontend/public ./public
COPY frontend/src ./src

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
