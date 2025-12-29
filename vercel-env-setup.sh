#!/bin/bash

# Script para configurar variables de entorno en Vercel (Client)
# Ejecutar desde el directorio raíz del proyecto

set -e

echo "🔵 Configurando Variables de Entorno en VERCEL"
echo "=============================================="
echo ""

cd client

# Verificar si está linkeado
if [ ! -d ".vercel" ]; then
    echo "⚠️  Proyecto no linkeado. Ejecutando vercel link..."
    vercel link
fi

echo ""
echo "📝 Ingresa los valores para cada variable de entorno:"
echo ""

# API URL
read -p "VITE_API_URL (ej: https://tu-api.onrender.com): " api_url
echo "$api_url" | vercel env add VITE_API_URL production

# Socket URL
read -p "VITE_SOCKET_URL (ej: https://tu-api.onrender.com): " socket_url
echo "$socket_url" | vercel env add VITE_SOCKET_URL production

# MercadoPago
read -p "VITE_MERCADOPAGO_PUBLIC_KEY: " mercadopago_key
echo "$mercadopago_key" | vercel env add VITE_MERCADOPAGO_PUBLIC_KEY production

# Wompi
read -p "VITE_WOMPI_PUBLIC_KEY: " wompi_key
echo "$wompi_key" | vercel env add VITE_WOMPI_PUBLIC_KEY production

# Google Analytics
read -p "VITE_GA_TRACKING_ID (ej: G-XXXXXXXXXX): " ga_id
echo "$ga_id" | vercel env add VITE_GA_TRACKING_ID production

# Environment
echo "production" | vercel env add VITE_NODE_ENV production

echo ""
echo "✅ Variables configuradas en Vercel (Production)"
echo ""
echo "Para ver todas las variables:"
echo "  vercel env ls"
echo ""
echo "Para desplegar:"
echo "  vercel --prod"

cd ..
