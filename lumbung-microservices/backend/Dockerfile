# Backend Dockerfile
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY schema.prisma ./

RUN npm install

COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Build
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
