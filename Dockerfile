FROM node:18-alpine

RUN apk add --no-cache libc6-compat python3 make g++ postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
