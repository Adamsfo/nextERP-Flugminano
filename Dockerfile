FROM node:22.4.1-slim

RUN apt-get update && apt-get install -y git

WORKDIR /home/dev/nextERP

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# CMD ["tail", "-f", "/dev/null"]
CMD ["npm", "run", "dev"]