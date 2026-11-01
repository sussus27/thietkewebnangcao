FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=4003

EXPOSE 4003

CMD ["npm", "start"]
