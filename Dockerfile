# Use Node.js 20 Alpine for a smaller image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create volume mount points for persistent data
VOLUME ["/app/data"]

# Set environment variables (these will be overridden by docker run or docker-compose)
ENV NODE_ENV=production

# Run the bot
CMD ["node", "index.js"]
