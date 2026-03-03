FROM mcr.microsoft.com/playwright:v1.41.2-jammy

WORKDIR /app

# 依存関係のインストール
COPY package.json yarn.lock* ./
RUN yarn install

COPY . .
