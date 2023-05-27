FROM node:20.2.0-bullseye
WORKDIR /opt
COPY . .
RUN npm ci
RUN npm run build
CMD [ "node", "main.js" ]
