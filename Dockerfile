FROM node:22-alpine

WORKDIR /app

# Habilitar Corepack
RUN corepack enable

# Configurar pnpm con timeouts más largos
RUN pnpm config set fetch-retries 5
RUN pnpm config set fetch-retry-mintimeout 100000
RUN pnpm config set fetch-retry-maxtimeout 600000
RUN pnpm config set network-timeout 1000000

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar TODAS las dependencias (incluyendo devDependencies)
RUN pnpm install

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo con hot-reload
CMD ["pnpm", "run", "start:dev"]