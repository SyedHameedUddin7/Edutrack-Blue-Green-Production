FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

CMD ["node", "server.js"]
