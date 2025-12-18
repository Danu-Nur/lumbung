# Backend Dockerfile
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
# Generate Prisma Client
RUN npx prisma generate

COPY src ./src

# Build
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
