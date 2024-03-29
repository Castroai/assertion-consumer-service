# Base image
FROM --platform=linux/amd64 node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

RUN npx prisma generate

COPY prisma ./prisma/

# RUN npx prisma migrate dev

# Creates a "dist" folder with the production build
RUN npm run build

EXPOSE 80

# Start the server using the production build
CMD [ "node", "dist/src/main.js" ]
