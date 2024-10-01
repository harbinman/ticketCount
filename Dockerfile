FROM node:alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制其余的应用代码
COPY . .

# 设置启动命令
CMD ["node", "index.js"]
