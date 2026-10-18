FROM node:22-alpine
WORKDIR /app
COPY analytics-service/project-worker.mjs analytics-service/server.mjs ./
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8787
USER node
EXPOSE 8787
CMD ["node", "server.mjs"]
