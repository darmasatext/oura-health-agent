# 🔍 Diagnóstico Completo - Dashboard Oura

**Fecha:** 2026-04-03 19:05  
**Problema:** Páginas de Actividad e Insights (correlaciones) no funcionan

---

## 🎯 PLAN DE ACCIÓN

### **Opción A: Fix Rápido (30 minutos)**
Debuggear directamente en Mac Mini viendo logs en tiempo real.

### **Opción B: Rollback (5 minutos)**
Volver a una versión que funcionaba antes.

### **Opción C: Deploy desde Cero (1 hora)**
Verificar CADA componente paso a paso.

---

## 🔍 DIAGNÓSTICO PASO A PASO

### 1. **Verificar qué versión está corriendo**

```bash
cd ~/oura-temp/dashboard

# Ver versión en package.json
grep '"version"' package.json

# Ver si tiene los fixes
grep -n "sedentary_time_seconds" lib/queries-multiuser.ts

# Debería mostrar líneas comentadas con "--"
```

### 2. **Ver logs del servidor en TIEMPO REAL**

```bash
cd ~/oura-temp

# Detener dashboard
pkill -f "next dev"

# Iniciar en foreground (ver errores directamente)
cd dashboard
npm run dev
```

Esto te mostrará EXACTAMENTE qué error está pasando cuando intentas abrir /activity o /insights.

**NO CIERRES ESA TERMINAL.** Abre el browser, ve a las páginas rotas, y PEGA LOS ERRORES que aparezcan.

### 3. **Probar APIs directamente**

En otra terminal:

```bash
# Probar actividad
curl -v "http://localhost:3000/api/activity?type=recent&days=7&user=fer&start=2026-03-28&end=2026-04-03" 2>&1 | grep -E "HTTP|error|Error"

# Probar correlaciones
curl -v "http://localhost:3000/api/insights?type=correlations&user=fer" 2>&1 | grep -E "HTTP|error|Error"
```

### 4. **Verificar BigQuery directamente**

```bash
# Probar query de actividad
bq query --use_legacy_sql=false '
SELECT calendar_date, steps, activity_score, active_calories
FROM `last-240000.oura_biometrics.daily_biometrics_fer`
WHERE calendar_date >= "2026-03-28"
ORDER BY calendar_date DESC
LIMIT 5'

# Probar query de correlaciones (datos para calcular)
bq query --use_legacy_sql=false '
SELECT COUNT(*) as total
FROM `last-240000.oura_biometrics.daily_biometrics_fer`
WHERE sleep_score IS NOT NULL
  AND readiness_score IS NOT NULL
  AND activity_score IS NOT NULL'
```

---

## 🚨 PROBLEMAS CONOCIDOS

### **Problema 1: sedentary_time_seconds**
- **Estado:** Columna comentada en queries
- **Impacto:** NO debería afectar (comentado con --)
- **Verificación:** `grep "sedentary" lib/queries-multiuser.ts`

### **Problema 2: Correlaciones**
- **Código fix:** Agregado en v6.2
- **Estado:** Puede no estar desplegado
- **Verificación:** `grep "correlations.sort" app/api/insights/route.ts`

### **Problema 3: Cache de Next.js**
- **Síntoma:** Código actualizado pero sigue sirviendo versión vieja
- **Fix:** `rm -rf .next && npm run build`

---

## 💡 MI PROPUESTA (Opción A - Fix Rápido)

**Paso 1:** Ejecuta dashboard en foreground para ver errores
```bash
cd ~/oura-temp/dashboard
pkill -f "next dev"
rm -rf .next
npm run dev
```

**Paso 2:** Abre browser → http://localhost:3000/activity

**Paso 3:** PEGA TODO el error que aparezca en la terminal

**Paso 4:** Con el error real, hago el fix específico en 5 minutos

---

## 🔄 ALTERNATIVA (Opción B - Rollback)

Si prefieres volver a una versión funcional:

```bash
cd ~/oura-temp

# Ver backups disponibles
ls -lat dashboard.bak-* | head -5

# Restaurar el más reciente que funcionaba
# (pregúntame cuál era la última versión funcional)
mv dashboard dashboard.broken
mv dashboard.bak-YYYYMMDD-HHMMSS dashboard

cd dashboard
pkill -f "next dev"
npm run dev
```

---

## 📊 INFORMACIÓN QUE NECESITO

Para darte un fix certero, necesito:

1. **Logs del servidor** cuando abres /activity (corriendo en foreground)
2. **Respuesta de la API** (`curl http://localhost:3000/api/activity?...`)
3. **Confirmar qué versión** está desplegada (`grep sedentary lib/queries-multiuser.ts`)

---

## 🎯 TU DECISIÓN

**Opción A:** Dame 10 minutos, corre dashboard en foreground, pégame el error real → Fix certero

**Opción B:** Rollback a versión funcional anterior → Dashboard funcionando en 5 min, arreglamos después

**Opción C:** Te doy acceso SSH para que yo debuggee directamente (si confías)

¿Qué prefieres?

---

**Creado por:** Agent main  
**Estado:** Esperando decisión del usuario  
**Tiempo invertido hoy:** ~3 horas  
**Progreso:** Dashboard 95% funcional, solo falta Actividad + Correlaciones
