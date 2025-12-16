# Frontend Dockerfile
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
# COPY next.config.ts ./
# Copy other necessary files if any
COPY schema.prisma ./

RUN npm install
RUN npx prisma generate

COPY public ./public
COPY src ./src

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
