# Use an official node runtime as a parent image
FROM node:23-alpine

WORKDIR /app/

# Install dependencies
COPY package.json /app/

RUN npm install --loglevel verbose

# Add rest of the client code
COPY . /app/

EXPOSE 5173

CMD npm run dev
