# 🚀 Deployment a Vercel - Oura Health Dashboard

## ✅ Preparación Completada

El código está listo para production. Solo necesitas hacer el deployment.

---

## 📋 Paso 1: Variables de Entorno

Necesitas configurar estas variables en Vercel:

```bash
GOOGLE_CLOUD_PROJECT_ID=last-240000
BIGQUERY_DATASET_BRONZE=oura_biometrics
BIGQUERY_DATASET_SILVER=oura_analytics
BIGQUERY_DATASET_GOLD=oura_dashboard
BIGQUERY_DATASET=oura_biometrics
BIGQUERY_TABLE=daily_biometrics_v2
```

**IMPORTANTE:** También necesitas el Service Account JSON de Google Cloud.

El archivo está en: `/home/coder/.secrets/service_account.json`

Copia su contenido y créalo como variable de entorno:
- Nombre: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- Valor: (pega el contenido completo del JSON)

---

## 🚀 Paso 2: Deploy con Vercel CLI

Desde este directorio (`dashboard/`), ejecuta:

```bash
vercel
```

Sigue las instrucciones:
1. Login con tu cuenta de Vercel (si no lo has hecho)
2. Link to existing project? → **No** (crear nuevo)
3. Project name: `oura-health-dashboard` (o el que prefieras)
4. Which directory? → `./` (ya estás en dashboard/)
5. Override settings? → **No**

El CLI detectará automáticamente que es Next.js y lo configurará.

---

## 🌍 Paso 3: Agregar Variables de Entorno en Vercel

Después del deployment inicial:

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a: **Settings** → **Environment Variables**
4. Agrega todas las variables listadas arriba
5. **Muy importante:** Agrega el Service Account JSON:
   - Name: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Value: (contenido del archivo `/home/coder/.secrets/service_account.json`)

---

## 🔄 Paso 4: Redeploy

Después de agregar las variables:

```bash
vercel --prod
```

Esto creará el deployment de producción con todas las variables configuradas.

---

## ✅ Resultado

Obtendrás una URL pública tipo:
```
https://oura-health-dashboard.vercel.app
```

**Ventajas:**
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Sin problemas de caché
- ✅ Actualizaciones automáticas con git push
- ✅ Gratis para proyectos personales

---

## 🔐 Service Account

Para obtener el contenido del service account:

```bash
cat /home/coder/.secrets/service_account.json
```

Copia todo el JSON y úsalo en Vercel.

---

## 📝 Notas

- El footer "Hecho con ❤️ por Texta IA y OpenClaw 🦞" estará visible
- Todos los fixes aplicados estarán en producción
- No necesitas tunnel de Cloudflare ni configuración adicional

---

## 🆘 Ayuda

Si tienes problemas:
1. Verifica que todas las variables estén configuradas
2. Revisa los logs en: https://vercel.com/dashboard → tu proyecto → Deployments
3. El service account debe tener permisos de BigQuery

---

¡Listo para producción! 🎉
