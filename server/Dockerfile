# Prepzone API — Oracle Cloud Ampere (ARM64) va x86 da ishlaydi.
# Build context — repo ildizi (docker-compose.yml): API content/sat dagi
# testlar va src/utils/irtScoring.js (baholash) dan foydalanadi, shuning
# uchun image ichida repo tuzilishi saqlanadi: /repo/server, /repo/content.
# Qaysi fayllar kirishi: server/Dockerfile.dockerignore.
FROM node:22-alpine
WORKDIR /repo/server
ENV NODE_ENV=production
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
# Ildizdagi package.json — content/ va src/utils/ ES modul sifatida o'qilishi uchun ("type": "module").
COPY package.json /repo/package.json
COPY content /repo/content
COPY src/utils/irtScoring.js /repo/src/utils/irtScoring.js
COPY server/src ./src
COPY server/scripts ./scripts
COPY server/question-bank ./question-bank
USER node
EXPOSE 4000
CMD ["node", "src/index.js"]
