# ⚙ AutoParts GT v2 — Tienda de Repuestos Automotrices

E-commerce completo estilo Pacifiko para repuestos vehiculares con Google Sign-In, búsqueda por vehículo e inventario en tiempo real.

## 🚀 Instalación

### PASO 1 — Backend (Apps Script)
1. Crea hoja en sheets.google.com → Extensiones → Apps Script
2. Pega el contenido de `api/Code.gs` → Guarda
3. Selecciona `initializeSheets` → ▶ Ejecutar → Acepta permisos
4. Implementar → Nueva implementación → Web App → Cualquier persona
5. Copia la URL generada

### PASO 2 — Google Sign-In (opcional pero recomendado)
1. Ve a console.cloud.google.com
2. Crea proyecto → APIs y Servicios → Credenciales
3. Crear credencial → ID de cliente OAuth 2.0 → Aplicación web
4. En "Orígenes autorizados" agrega tu dominio de Netlify
5. Copia el Client ID

### PASO 3 — Frontend
1. Edita `frontend-deploy/js/config.js`:
   - Pega tu URL de Apps Script en API_BASE_URL
   - Pega tu Google Client ID en GOOGLE_CLIENT_ID
2. Sube `frontend-deploy/` a Netlify (drag & drop)

### 🔑 Admin: admin@autoparts.com / admin123

## 📦 Características
- Tema claro premium: cobre/carbón/crema (estilo taller mecánico)
- Login con Google (un clic, sin contraseña)
- Búsqueda por vehículo (marca + modelo + año)
- Banners promocionales, categorías con iconos
- Precios con descuento y badges de %
- Número de parte, compatibilidad vehicular
- 9 categorías + 18 marcas precargadas
- NIT guatemalteco en checkout
- WhatsApp flotante
- Footer informativo
- 100% responsivo
