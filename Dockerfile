FROM node:19.7.0-buster-slim
WORKDIR /app
COPY package.json ./
RUN yarn