# Etapa 1: Construcción de la aplicación
FROM node:18-alpine AS builder

# Configuración del directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar los archivos necesarios
COPY pnpm-lock.yaml ./
COPY package.json ./

# Instalar dependencias con pnpm
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN pnpm run build

# Etapa 2: Ejecución de la aplicación
FROM node:18-alpine

# Configuración del directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar solo lo necesario desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Exponer el puerto de la API
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["pnpm", "run", "start:prod"]