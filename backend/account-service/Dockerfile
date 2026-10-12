FROM node:20-alpine

WORKDIR /usr/src/app

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Keep build dependencies for runtime (bcrypt may need them)
# If you want to remove them, uncomment the line below
# RUN apk del python3 make g++

# Copy application code
COPY . .

ENV NODE_ENV=production
ENV PORT=4001

EXPOSE 4001

CMD ["npm", "start"]

