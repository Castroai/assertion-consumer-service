# Use the official Node.js LTS image as the base image
FROM node:lts AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code to the working directory
COPY . .

# Build the Nest.js application
RUN npm run build

# Use a lighter image for the runtime
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Expose the port that your Nest.js app will run on
EXPOSE 3000

# Start the Nest.js application
CMD ["node", "dist/main"]
