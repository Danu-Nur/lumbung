# Backend Dockerfile
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY schema.prisma ./

RUN npm install

COPY src ./src
COPY seed-plans.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Build
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
