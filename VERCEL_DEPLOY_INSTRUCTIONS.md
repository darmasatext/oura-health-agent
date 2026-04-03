# 🚀 Deploy a Vercel - Instrucciones Completas

**Tiempo estimado:** 5 minutos

---

## PASO 1: Instalar Vercel CLI (1 min)

En TU máquina (tu laptop/computadora):

```bash
npm i -g vercel
```

Si no tienes npm, instala Node.js primero: https://nodejs.org/

---

## PASO 2: Descargar el Proyecto (2 min)

**Opción A: Clonar desde VM (si tienes acceso SSH)**

```bash
# Desde tu máquina
scp -r usuario@vm-ip:/home/coder/.openclaw/workspace/oura-dashboard ./
cd oura-dashboard
```

**Opción B: Descargar ZIP**

Te enviaré un ZIP del proyecto por Telegram.

**Opción C: GitHub**

Si el proyecto ya está en GitHub, clónalo:
```bash
git clone [URL-del-repo]
cd oura-dashboard
```

---

## PASO 3: Login en Vercel (30 seg)

```bash
vercel login
```

Esto abrirá tu browser. Autoriza con tu cuenta de Vercel (o crea una gratis).

---

## PASO 4: Configurar Variables de Entorno (1 min)

Cuando hagas deploy, Vercel te preguntará por las variables de entorno.

**Copia y pega estas:**

```
GOOGLE_CLOUD_PROJECT_ID=last-240000
BIGQUERY_DATASET=oura_biometrics
BIGQUERY_TABLE=daily_biometrics_gold
```

**Para GOOGLE_APPLICATION_CREDENTIALS_JSON:**

Vercel te preguntará. Pega TODO el contenido del archivo `gcp-service-account.json` (el JSON que me enviaste) en UNA SOLA LÍNEA.

O mejor, usa el archivo `gcp-key-oneline.txt` que ya está preparado.

---

## PASO 5: Deploy (1 min)

```bash
# Dentro de la carpeta oura-dashboard
vercel --prod
```

Vercel te preguntará:
- **Set up and deploy?** → YES
- **Which scope?** → Tu cuenta personal
- **Link to existing project?** → NO (es nuevo)
- **What's your project's name?** → oura-dashboard (o el que quieras)
- **In which directory is your code located?** → ./ (enter)
- **Want to override settings?** → NO

Después pedirá las variables de entorno. Copia las de arriba.

---

## PASO 6: ¡Listo! 🎉

Vercel te dará una URL pública tipo:
```
https://oura-dashboard-xxxx.vercel.app
```

**Esa URL es tu dashboard funcionando en producción** 🚀

---

## 🔧 TROUBLESHOOTING

**Si falla el build:**

Vercel usa el mismo comando que funciona aquí:
```bash
npm run build
```

Revisa los logs en el dashboard de Vercel.

**Si faltan variables de entorno:**

Puedes agregarlas después en:
- Vercel Dashboard → Tu proyecto → Settings → Environment Variables

**Si BigQuery falla:**

Verifica que el JSON de service account esté completo (incluyendo `\n` en la private key).

---

## 📝 ARCHIVOS QUE NECESITAS

**En tu máquina:**

1. Todo el código del proyecto `oura-dashboard/`
2. El archivo `gcp-service-account.json` (el que me enviaste)

**NO subas a GitHub:**
- `gcp-service-account.json` (secreto)
- `.env.local`
- `node_modules/`
- `.next/`

(Ya están en `.gitignore` y `.vercelignore`)

---

## 🎯 COMANDO RÁPIDO (TODO EN UNO)

Si ya tienes todo instalado:

```bash
cd oura-dashboard
vercel --prod
```

Y sigue las instrucciones interactivas.

---

## 💡 TIPS

1. **Primera vez usa `vercel`** (sin --prod) para hacer un deploy de prueba
2. **Cuando funcione, usa `vercel --prod`** para producción
3. **Vercel detecta Next.js automáticamente** - no necesitas configurar nada
4. **Deploy automático:** Conecta tu GitHub y cada push hace deploy automático

---

## 🆘 SI NECESITAS AYUDA

Mándame:
- Screenshot de los errores
- Logs de Vercel
- Comando que ejecutaste

Y te ayudo a resolverlo.

---

**¡Buena suerte!** 🚀

