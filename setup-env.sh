#!/bin/bash

echo "🚀 BORIS - Configuración de Variables de Entorno"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==================================
# 1. VERCEL (Frontend/Client)
# ==================================
echo -e "${BLUE}📦 1. CONFIGURANDO VERCEL (Client)${NC}"
echo "Primero, asegúrate de hacer login:"
echo "  vercel login"
echo ""
echo "Luego, linkea el proyecto (si no lo has hecho):"
echo "  cd client && vercel link"
echo ""
echo "Ahora configura las variables de entorno para PRODUCCIÓN:"
echo ""

cat << 'EOF'
# Variables para el CLIENT (Vercel)
vercel env add VITE_API_URL production
# Ingresa: https://tu-api.render.com (o tu URL de Render)

vercel env add VITE_SOCKET_URL production
# Ingresa: https://tu-api.render.com (o tu URL de Render)

vercel env add VITE_MERCADOPAGO_PUBLIC_KEY production
# Ingresa tu public key de MercadoPago

vercel env add VITE_WOMPI_PUBLIC_KEY production
# Ingresa tu public key de Wompi

vercel env add VITE_GA_TRACKING_ID production
# Ingresa tu ID de Google Analytics (ej: G-XXXXXXXXXX)

vercel env add VITE_NODE_ENV production
# Ingresa: production
EOF

echo ""
echo -e "${YELLOW}💡 Tip: También puedes configurar las variables desde el dashboard de Vercel:${NC}"
echo "   https://vercel.com/dashboard → tu-proyecto → Settings → Environment Variables"
echo ""

# ==================================
# 2. RENDER (Backend/Server)
# ==================================
echo -e "${BLUE}🖥️  2. CONFIGURANDO RENDER (Server)${NC}"
echo "Primero, asegúrate de hacer login:"
echo "  render login"
echo ""
echo "Luego, configura las variables desde el dashboard o usa el CLI:"
echo ""

cat << 'EOF'
# Variables para el SERVER (Render)
# Ve a: https://dashboard.render.com → tu-servicio → Environment

# Copia estas variables (debes configurarlas manualmente en Render Dashboard):

PORT=3000
NODE_ENV=production
API_URL=https://tu-api.render.com
CLIENT_URL=https://tu-app.vercel.app

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@db.xxxx.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# JWT
JWT_SECRET=tu_super_secret_jwt_key_aqui
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_access_token
MERCADOPAGO_PUBLIC_KEY=tu_mercadopago_public_key

# Wompi
WOMPI_PUBLIC_KEY=tu_wompi_public_key
WOMPI_PRIVATE_KEY=tu_wompi_private_key
WOMPI_EVENTS_SECRET=tu_wompi_events_secret

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_ACCESS_TOKEN=tu_access_token
WHATSAPP_VERIFY_TOKEN=tu_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_business_account_id

# Email (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
EMAIL_FROM=Mar de Sabores <noreply@mardesabores.com>

# Google Maps (Opcional)
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# Cloudinary (Opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
EOF

echo ""
echo -e "${YELLOW}💡 Nota: Render CLI tiene soporte limitado para env vars. Es mejor usar el dashboard:${NC}"
echo "   https://dashboard.render.com"
echo ""

# ==================================
# 3. SUPABASE
# ==================================
echo -e "${BLUE}🗄️  3. CONFIGURANDO SUPABASE${NC}"
echo "Primero, haz login:"
echo "  supabase login"
echo ""
echo "Para obtener tus credenciales de Supabase:"
echo ""

cat << 'EOF'
# Obtener información del proyecto
supabase projects list

# Obtener la URL y las API Keys
supabase projects api-keys --project-ref tu-project-ref

# O desde el dashboard:
# https://supabase.com/dashboard/project/tu-project-id/settings/api

# Necesitas:
# - SUPABASE_URL: https://xxxx.supabase.co
# - SUPABASE_ANON_KEY: (anon/public key)
# - SUPABASE_SERVICE_ROLE_KEY: (service_role key - mantén en secreto!)
# - DATABASE_URL: postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
EOF

echo ""
echo -e "${GREEN}✅ SIGUIENTE PASO:${NC}"
echo "1. Ejecuta los comandos de Vercel para configurar el client"
echo "2. Ve al dashboard de Render y configura las variables del server"
echo "3. Obtén las credenciales de Supabase y actualiza ambos (Vercel y Render)"
echo ""
echo "¿Necesitas ayuda con algún paso específico?"
