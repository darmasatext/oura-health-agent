# 🚀 Guía de Deployment a Vercel

**Proyecto:** Oura Health Dashboard  
**Repo:** https://github.com/darmasatext/oura-health-agent

---

## 📋 PRE-REQUISITOS

✅ Repositorio en GitHub con el dashboard  
✅ BigQuery 100% documentado (117 columnas)  
✅ Dashboard funcionando localmente  
✅ Service Account JSON de GCP  

---

## 🎯 PASO 1: CREAR CUENTA EN VERCEL

1. Ve a: https://vercel.com/signup
2. Selecciona **"Continue with GitHub"**
3. Autoriza Vercel en tu cuenta de GitHub
4. Selecciona **"Hobby"** (plan gratuito)

---

## 🔗 PASO 2: IMPORTAR PROYECTO DESDE GITHUB

1. En Vercel Dashboard, clic en **"Add New Project"**
2. Busca el repositorio: **`darmasatext/oura-health-agent`**
3. Clic en **"Import"**

---

## ⚙️ PASO 3: CONFIGURAR EL PROYECTO

### Framework Preset
- Selecciona: **Next.js**

### Root Directory
- Cambia a: **`dashboard`** ⚠️ (MUY IMPORTANTE)
- Clic en **"Edit"** → escribe `dashboard` → clic fuera para aplicar

### Build and Output Settings
- **Build Command:** `npm run build` (auto-detectado)
- **Output Directory:** `.next` (auto-detectado)
- **Install Command:** `npm install` (auto-detectado)

✅ Deja todo lo demás por defecto

---

## 🔐 PASO 4: VARIABLES DE ENTORNO

Clic en **"Environment Variables"** y agrega:

### Variable 1: GOOGLE_CLOUD_PROJECT_ID
```
Name: GOOGLE_CLOUD_PROJECT_ID
Value: last-240000
```

### Variable 2: GOOGLE_APPLICATION_CREDENTIALS_JSON
```
Name: GOOGLE_APPLICATION_CREDENTIALS_JSON
Value: {PEGA AQUÍ EL CONTENIDO COMPLETO DEL service_account.json}
```

**⚠️ IMPORTANTE:** 
- Abre el archivo `~/Downloads/oura-dashboard/config/service_account.json`
- Copia **TODO** el contenido (desde `{` hasta `}` incluyendo las llaves)
- Pégalo como valor de la variable

**Ejemplo del formato esperado:**
```json
{
  "type": "service_account",
  "project_id": "last-240000",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  ...
}
```

### Variable 3 (Opcional): NODE_ENV
```
Name: NODE_ENV
Value: production
```

---

## 🚀 PASO 5: DEPLOY

1. Clic en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel:
   - Clona el repositorio
   - Instala dependencias (`npm install`)
   - Ejecuta el build (`npm run build`)
   - Despliega a producción

---

## ✅ PASO 6: VERIFICACIÓN

### 6.1 Verifica que el build sea exitoso
- Deberías ver: ✅ **"Deployment Ready"**
- Vercel te dará una URL: `https://oura-health-agent-xxx.vercel.app`

### 6.2 Prueba el dashboard
1. Clic en **"Visit"** o abre la URL
2. Verifica que cargue el dashboard
3. Prueba cambiar entre pestañas (Home, Sueño, Recuperación, etc.)
4. Cambia el idioma (ES ↔ EN)
5. Verifica que los datos carguen correctamente

### 6.3 Revisa los logs si hay errores
- En Vercel Dashboard → Tu proyecto → **"Logs"**
- Busca errores de autenticación con BigQuery
- Busca errores de queries

---

## 🐛 TROUBLESHOOTING

### Error: "Failed to build"
**Causa:** Error en el código o dependencias  
**Solución:** 
1. Revisa los logs de build en Vercel
2. Verifica que el `Root Directory` sea `dashboard`
3. Asegúrate de que `npm run build` funcione localmente

### Error: "Permission denied" en BigQuery
**Causa:** Service account sin permisos o JSON mal formateado  
**Solución:**
1. Verifica que el JSON esté completo (incluyendo `private_key`)
2. Verifica que el service account tenga rol `BigQuery Data Viewer`
3. Re-copia el JSON asegurándote de incluir TODO

### Error: "Module not found"
**Causa:** Dependencias faltantes  
**Solución:**
1. Verifica que `package.json` esté en `/dashboard/`
2. Asegúrate de que todas las deps estén en `dependencies` (no `devDependencies`)

### Dashboard carga pero no muestra datos
**Causa:** Problema de autenticación con BigQuery  
**Solución:**
1. Revisa los logs de la función API en Vercel
2. Verifica que `GOOGLE_APPLICATION_CREDENTIALS_JSON` tenga el JSON completo
3. Verifica que el service account tenga permisos en el proyecto `last-240000`

---

## 🎨 PASO 7: CONFIGURAR DOMINIO PERSONALIZADO (Opcional)

### Opción A: Subdominio de Vercel (gratis)
1. En Vercel Dashboard → Settings → Domains
2. Clic en **"Edit"** al lado de la URL auto-generada
3. Cambia a algo memorable: `oura-dashboard-xxx.vercel.app`

### Opción B: Dominio personalizado
1. En Settings → Domains → **"Add"**
2. Escribe tu dominio: `oura.tudominio.com`
3. Sigue las instrucciones para configurar DNS
4. Vercel automáticamente configura SSL (HTTPS)

---

## 📊 PASO 8: MONITOREO

### Analytics (opcional)
1. En Vercel Dashboard → Analytics
2. Activa **Vercel Analytics** (gratis en Hobby plan)
3. Ve métricas de uso, performance, etc.

### Logs en tiempo real
1. Vercel Dashboard → Tu proyecto → **"Logs"**
2. Filtra por tipo: Build, Edge, Serverless Functions
3. Útil para debugging en producción

---

## 🔄 PASO 9: ACTUALIZACIONES FUTURAS

Cada vez que hagas `git push` a la rama `main`:
1. Vercel detecta el cambio automáticamente
2. Inicia un nuevo build
3. Si el build es exitoso, despliega automáticamente
4. Rollback automático si el build falla

**Para hacer cambios:**
```bash
cd ~/Downloads/oura-dashboard
# Hacer cambios en el código
git add .
git commit -m "feat: descripción del cambio"
git push origin main
# Vercel desplegará automáticamente en ~2 minutos
```

---

## 🎯 CHECKLIST FINAL

Antes de considerar el deployment completo, verifica:

- [ ] Dashboard carga correctamente
- [ ] Todas las pestañas funcionan (Home, Sueño, Recuperación, Actividad, Insights, Compare)
- [ ] Los datos de BigQuery se cargan correctamente
- [ ] Cambio de idioma funciona (ES ↔ EN)
- [ ] Dark mode funciona
- [ ] Filtros de fecha funcionan
- [ ] Gráficos renderizan correctamente
- [ ] No hay errores en la consola del navegador
- [ ] Footer muestra "Hecho con ❤️ por Texta IA y OpenClaw 🦞"

---

## 📝 NOTAS IMPORTANTES

### Límites del Plan Hobby (Gratuito)
- ✅ 100 GB de ancho de banda/mes
- ✅ Builds ilimitados
- ✅ SSL automático (HTTPS)
- ✅ Deploy automático desde GitHub
- ⚠️ Serverless Functions: 100 horas de ejecución/mes
- ⚠️ Si excedes, Vercel suspende el sitio temporalmente

### Optimización para el plan gratuito
- El dashboard usa Server-Side Rendering (SSR)
- Cada carga de página consume tiempo de función
- Considera agregar cache en el futuro si el uso es alto

### Seguridad
- ✅ Service account JSON está encriptado en Vercel
- ✅ Solo las funciones de Vercel pueden acceder a las variables de entorno
- ✅ El JSON nunca se expone al navegador del usuario
- ⚠️ Considera rotar el service account periódicamente

---

## 🆘 SOPORTE

Si tienes problemas durante el deployment, revisa:
1. **Vercel Docs:** https://vercel.com/docs
2. **Next.js Deployment:** https://nextjs.org/docs/deployment
3. **BigQuery Auth:** https://cloud.google.com/docs/authentication

---

**¡Listo para deployment! 🚀**

Sigue los pasos y avísame si encuentras algún error.
