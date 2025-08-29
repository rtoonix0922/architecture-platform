FROM node:20-alpine
WORKDIR /app

# install only prod deps (falls back to npm install if lockfile missing)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# copy the app
COPY . .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node","server.js"]