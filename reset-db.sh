#!/bin/bash

# Script para resetear la base de datos y aplicar migraciones iniciales
# Uso: ./reset-db.sh

set -e  # Detener en cualquier error

echo "=== Reset de Base de Datos Hostal ==="
echo ""

# Verificar que los contenedores estén corriendo
echo "Verificando contenedores..."
if ! docker ps | grep -q "mariadb"; then
    echo "ERROR: El contenedor 'mariadb' no está corriendo"
    echo "Ejecuta primero: docker compose up -d"
    exit 1
fi

if ! docker ps | grep -q "nestjs-api"; then
    echo "ERROR: El contenedor 'nestjs-api' no está corriendo"
    echo "Ejecuta primero: docker compose up -d"
    exit 1
fi

echo "Contenedores OK"
echo ""

# Eliminar y recrear la base de datos
echo "1. Eliminando base de datos 'hostal'..."
docker exec -i mariadb mysql -u root -proot -e "DROP DATABASE IF EXISTS hostal;"
echo "   Base de datos eliminada"
echo ""

echo "2. Creando base de datos 'hostal' vacía..."
docker exec -i mariadb mysql -u root -proot -e "CREATE DATABASE hostal;"
echo "   Base de datos creada"
echo ""

# Ejecutar migraciones
echo "3. Ejecutando migraciones..."
docker exec -it nestjs-api npx typeorm-ts-node-commonjs migration:run -d ./src/data-source.ts
echo ""

echo "=== Reset completado exitosamente ==="
echo "Tu base de datos ahora tiene todas las tablas creadas desde la migración inicial."
