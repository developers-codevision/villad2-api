# Etapa 1: Construcción
FROM node:22-alpine AS builder

WORKDIR /app

# Habilitar Corepack y preparar pnpm (usa la versión de tu package.json si tienes "packageManager" definido)
RUN corepack enable

# Si no tienes "packageManager" en package.json, especifica la versión aquí
# RUN corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm config set fetch-retries 5
RUN pnpm config set fetch-retry-mintimeout 100000
RUN pnpm config set fetch-retry-maxtimeout 600000
RUN pnpm config set network-timeout 1000000

# Ahora sí el install
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Etapa 2: Producción
FROM node:22-alpine

WORKDIR /app

# Habilitar Corepack (no necesitas preparar versión específica si usas el campo packageManager en package.json)
RUN corepack enable

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar SOLO dependencias de producción (imagen más pequeña y sin symlinks rotos)
RUN pnpm install --prod --frozen-lockfile

# Copiar el build desde la etapa anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]