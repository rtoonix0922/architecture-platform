FROM node:20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20
WORKDIR /app
ENV PORT=3000
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm","start"]
