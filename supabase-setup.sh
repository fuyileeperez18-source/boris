#!/bin/bash

# Script para obtener credenciales de Supabase

set -e

echo "🗄️  Obteniendo Credenciales de SUPABASE"
echo "========================================"
echo ""

# Verificar si está logueado
if ! supabase projects list &> /dev/null; then
    echo "⚠️  No estás logueado en Supabase. Ejecutando login..."
    supabase login
fi

echo ""
echo "📋 Tus proyectos de Supabase:"
echo ""
supabase projects list

echo ""
read -p "Ingresa el Project ID (Reference ID) de tu proyecto: " project_ref

if [ -z "$project_ref" ]; then
    echo "❌ Error: Debes ingresar un Project ID"
    exit 1
fi

echo ""
echo "🔑 Obteniendo credenciales..."
echo ""

# Obtener las API keys
echo "====================================="
echo "API KEYS para tu proyecto:"
echo "====================================="
supabase projects api-keys --project-ref "$project_ref"

echo ""
echo "====================================="
echo "📝 RESUMEN DE VARIABLES:"
echo "====================================="
echo ""
echo "Para obtener la DATABASE_URL completa:"
echo "1. Ve a: https://supabase.com/dashboard/project/$project_ref/settings/database"
echo "2. Busca 'Connection string' → 'URI'"
echo "3. Copia la URL que tiene este formato:"
echo "   postgresql://postgres.[ref]:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres"
echo ""
echo "SUPABASE_URL: https://$project_ref.supabase.co"
echo ""
echo "Las API Keys se mostraron arriba ☝️"
echo "- anon/public key → SUPABASE_ANON_KEY"
echo "- service_role key → SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "====================================="
echo "✅ SIGUIENTE PASO:"
echo "====================================="
echo "1. Copia estas credenciales"
echo "2. Agrégalas a Vercel (client) - solo SUPABASE_URL y SUPABASE_ANON_KEY"
echo "3. Agrégalas a Render (server) - todas las variables incluyendo SERVICE_ROLE_KEY"
echo ""
echo "Para Vercel (desde el directorio client):"
echo "  echo 'https://$project_ref.supabase.co' | vercel env add VITE_SUPABASE_URL production"
echo "  echo 'tu_anon_key' | vercel env add VITE_SUPABASE_ANON_KEY production"
echo ""
echo "Para Render:"
echo "  Copia las variables manualmente en el dashboard:"
echo "  https://dashboard.render.com → Environment"
echo ""
