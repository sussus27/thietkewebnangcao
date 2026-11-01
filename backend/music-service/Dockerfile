FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application code
COPY . .

ENV NODE_ENV=production
ENV PORT=4004

EXPOSE 4004

CMD ["npm", "start"]
