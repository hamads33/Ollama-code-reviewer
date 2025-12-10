# Dockerfile
FROM node:20-alpine

# set workdir
WORKDIR /usr/src/app

# copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# install production dependencies
RUN npm ci --only=production

# copy app source
COPY . .

# ensure the port is available (server.js default 4000)
ENV NODE_ENV=production
EXPOSE 4000

# default command
CMD ["node", "server.js"]
