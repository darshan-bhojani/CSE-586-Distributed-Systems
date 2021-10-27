FROM node:17-alpine3.12

WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

# Install any needed packages
RUN npm i

# Bundle app source
COPY . .

EXPOSE 4201

CMD [ "npm", "start" ]