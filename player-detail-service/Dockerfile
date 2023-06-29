FROM node:20.2.0-bullseye
WORKDIR /opt/server
COPY ./package.json ./
COPY ./dist ./
USER 1000
CMD [ "node", "main.js" ]
