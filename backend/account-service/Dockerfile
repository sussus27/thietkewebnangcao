FROM node:20-alpine

WORKDIR /usr/src/app

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci --omit=dev && \
    npm rebuild bcrypt --build-from-source

# Keep build dependencies for runtime (bcrypt may need them)
# If you want to remove them, uncomment the line below
# RUN apk del python3 make g++

# Copy application code
COPY . .

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]

