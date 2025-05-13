# Use the node:20 image as the base image
FROM node:20

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Set npm config to disable SSL errors (optional)
RUN npm config set strict-ssl false

# Install only production dependencies
RUN npm install --only=production --no-optional

# Copy the application files and .env
COPY . .
COPY .env .env

# Expose the required ports
EXPOSE 3334 27017 6379 1-65535

# Start the application
CMD ["node", "server.js"]
