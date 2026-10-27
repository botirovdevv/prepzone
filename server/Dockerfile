# Prepzone API — Oracle Cloud Ampere (ARM64) va x86 da ishlaydi.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY scripts/make-admin.js ./scripts/make-admin.js
USER node
EXPOSE 4000
CMD ["node", "src/index.js"]
