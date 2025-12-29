# 🚀 Guía de Configuración de Variables de Entorno

Esta guía te ayudará a configurar todas las variables de entorno necesarias para desplegar BORIS en Vercel (frontend), Render (backend) y Supabase (base de datos).

---

## 📋 Tabla de Contenidos

1. [Supabase - Base de Datos](#1-supabase---base-de-datos)
2. [Vercel - Frontend (Client)](#2-vercel---frontend-client)
3. [Render - Backend (Server)](#3-render---backend-server)
4. [Scripts Automatizados](#4-scripts-automatizados)
5. [Validación](#5-validación)

---

## 1️⃣ Supabase - Base de Datos

### Paso 1: Login y obtener credenciales

```bash
# Ejecutar el script automatizado
./supabase-setup.sh
```

O manualmente:

```bash
# Login
supabase login

# Listar proyectos
supabase projects list

# Obtener API keys (reemplaza PROJECT_REF con tu ID)
supabase projects api-keys --project-ref TU_PROJECT_REF
```

### Paso 2: Obtener la DATABASE_URL

1. Ve a: https://supabase.com/dashboard/project/TU_PROJECT/settings/database
2. Busca **"Connection string"** → **"URI"**
3. Copia la URL (incluye tu password)

### Variables que necesitas de Supabase:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (¡Mantén en secreto!)
DATABASE_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
```

---

## 2️⃣ Vercel - Frontend (Client)

### Opción A: Script Automatizado (Recomendado)

```bash
./vercel-env-setup.sh
```

Este script te guiará paso a paso para configurar todas las variables.

### Opción B: Manual - CLI

```bash
cd client

# Link el proyecto (primera vez)
vercel link

# Agregar variables una por una
echo "https://tu-api.onrender.com" | vercel env add VITE_API_URL production
echo "https://tu-api.onrender.com" | vercel env add VITE_SOCKET_URL production
echo "tu_mercadopago_public_key" | vercel env add VITE_MERCADOPAGO_PUBLIC_KEY production
echo "tu_wompi_public_key" | vercel env add VITE_WOMPI_PUBLIC_KEY production
echo "G-XXXXXXXXXX" | vercel env add VITE_GA_TRACKING_ID production
echo "production" | vercel env add VITE_NODE_ENV production

# Opcional: Si usas Supabase en el client
echo "https://xxxx.supabase.co" | vercel env add VITE_SUPABASE_URL production
echo "tu_anon_key" | vercel env add VITE_SUPABASE_ANON_KEY production

# Ver todas las variables
vercel env ls
```

### Opción C: Dashboard de Vercel

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables para **Production**:

| Variable | Valor de Ejemplo |
|----------|------------------|
| `VITE_API_URL` | `https://tu-api.onrender.com` |
| `VITE_SOCKET_URL` | `https://tu-api.onrender.com` |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | Tu public key de MercadoPago |
| `VITE_WOMPI_PUBLIC_KEY` | Tu public key de Wompi |
| `VITE_GA_TRACKING_ID` | `G-XXXXXXXXXX` |
| `VITE_NODE_ENV` | `production` |

---

## 3️⃣ Render - Backend (Server)

### Configuración Manual (Dashboard)

1. Ve a: https://dashboard.render.com
2. Selecciona tu **Web Service**
3. Ve a **Environment** en el menú lateral
4. Haz clic en **"Add Environment Variable"**
5. Usa el archivo `render-env-template.txt` como referencia

### Variables Requeridas:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
API_URL=https://tu-servicio.onrender.com
CLIENT_URL=https://tu-app.vercel.app

# Supabase (de paso 1)
DATABASE_URL=postgresql://postgres.xxxx:[PASSWORD]@...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# JWT - Genera con: openssl rand -base64 32
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Pagos
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxx
WOMPI_PUBLIC_KEY=pub_prod_xxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxx
WOMPI_EVENTS_SECRET=tu_events_secret

# WhatsApp Business (opcional)
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxx
WHATSAPP_VERIFY_TOKEN=tu_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
EMAIL_FROM=Mar de Sabores <noreply@mardesabores.com>

# Otros (opcionales)
GOOGLE_MAPS_API_KEY=AIzaSy_xxxx
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=tu_api_secret
```

### ⚠️ Importante para Render:

- Después de agregar/modificar variables, Render **redesplegará automáticamente**
- Puedes verificar el despliegue en la pestaña **"Logs"**

---

## 4️⃣ Scripts Automatizados

He creado varios scripts para facilitar la configuración:

```bash
# 1. Guía general con todos los pasos
./setup-env.sh

# 2. Configurar Vercel (interactivo)
./vercel-env-setup.sh

# 3. Obtener credenciales de Supabase
./supabase-setup.sh
```

---

## 5️⃣ Validación

### Verificar Vercel

```bash
cd client
vercel env ls
```

Deberías ver todas las variables `VITE_*` configuradas.

### Verificar Render

1. Ve a: https://dashboard.render.com → Tu servicio → Environment
2. Verifica que todas las variables estén configuradas
3. Revisa los logs para confirmar que el servicio inició correctamente

### Verificar Supabase

```bash
supabase projects list
```

### Test de Conexión

Una vez desplegado todo:

```bash
# Test del backend
curl https://tu-api.onrender.com/health

# Test del frontend
# Visita: https://tu-app.vercel.app
```

---

## 🔐 Seguridad

### ⚠️ NUNCA expongas estas variables:

- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `WOMPI_PRIVATE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `WHATSAPP_ACCESS_TOKEN`
- `SMTP_PASS`
- `CLOUDINARY_API_SECRET`

### ✅ Buenas prácticas:

1. Usa valores diferentes para desarrollo y producción
2. Guarda las credenciales en un gestor de contraseñas (1Password, LastPass, etc.)
3. Nunca hagas commit de archivos `.env` reales
4. Rota las claves periódicamente
5. Usa variables de entorno específicas para cada ambiente

---

## 📚 Enlaces Útiles

- **Vercel CLI**: https://vercel.com/docs/cli
- **Render Dashboard**: https://dashboard.render.com
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Supabase CLI**: https://supabase.com/docs/guides/cli

---

## 🆘 Troubleshooting

### Error: "Vercel project not linked"

```bash
cd client
vercel link
```

### Error: "Supabase not logged in"

```bash
supabase login
```

### Las variables no se aplican en Vercel

Después de agregar variables, redesplega:

```bash
cd client
vercel --prod
```

### El backend en Render no inicia

1. Revisa los logs en: https://dashboard.render.com → Logs
2. Verifica que todas las variables requeridas estén configuradas
3. Asegúrate de que `DATABASE_URL` sea correcta

---

## ✅ Checklist Final

- [ ] Supabase: Proyecto creado y credenciales obtenidas
- [ ] Vercel: Todas las variables `VITE_*` configuradas
- [ ] Render: Todas las variables del server configuradas
- [ ] URLs actualizadas: `API_URL`, `CLIENT_URL`, `VITE_API_URL`
- [ ] Despliegues exitosos en ambas plataformas
- [ ] Tests básicos: frontend carga, backend responde

---

¿Necesitas ayuda con algún paso específico? ¡Avísame!
