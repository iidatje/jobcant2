FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

#COPY package.json yarn.lock* ./
COPY package.json ./
#RUN yarn install

RUN yarn config set strict-ssl false \
 && yarn install \
 && yarn config delete strict-ssl

COPY . .
