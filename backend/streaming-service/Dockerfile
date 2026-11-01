FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=4002

EXPOSE 4002

CMD ["npm", "start"]
