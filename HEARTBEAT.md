# 🏥 HEARTBEAT - Agente de Salud

## 📅 TAREAS PROGRAMADAS

### 🌅 REPORTE MATUTINO (8:00 AM CST)

**Frecuencia:** Diario  
**Trigger:** Si hora actual = 8:00-8:59 AM

**Acciones:**
1. Query datos de anoche (fecha más reciente)
2. Calcular promedios últimos 7 días
3. Comparar vs promedios
4. Generar insights automáticos
5. Enviar reporte por Telegram

**Formato:**
```
🌅 Buenos días Diego!

📊 RESUMEN DE ANOCHE (21 marzo):
😴 Sleep Score: 82/100 (+5 vs promedio 7d)
🔋 Readiness: 87/100 (+4 vs promedio)
⏰ Sueño total: 8.6h (↑45min vs promedio)
💤 Sueño profundo: 50min (↓10min)
❤️ FC mínima: 42 bpm (excelente)
🌡️ Temperatura: +0.04°C (normal)

💡 INSIGHT:
3ra noche consecutiva >8h. Recuperación excelente.

📈 TENDENCIA:
Tu readiness viene mejorando (+12% esta semana)
```

---

### 🌙 REPORTE VESPERTINO (8:00 PM CST)

**Frecuencia:** Diario  
**Trigger:** Si hora actual = 20:00-20:59 PM

**Acciones:**
1. Query datos de HOY (actividad del día)
2. Verificar si datos ya están disponibles (actualización 1 PM)
3. Comparar vs promedios
4. Preparación para la noche
5. Enviar reporte por Telegram

**Formato:**
```
🌙 Buenas noches Diego!

📊 RESUMEN DE HOY (22 marzo):
🏃 Activity Score: 56/100
👟 Pasos: 5,549 (vs 6,200 promedio)
🔥 Calorías activas: 324
⏱️ Tiempo sedentario: 10.2h (↑1h)

💡 PREPARACIÓN PARA DORMIR:
Tu readiness hoy: 71/100 (bajo)
Recomendación: Acuéstate antes de 11 PM para recuperar.

📈 PREDICCIÓN:
Si duermes >7.5h esta noche → Readiness mañana: ~82-85
```

---

### 🚨 ALERTAS INTELIGENTES (CUALQUIER HORA)

**Frecuencia:** Cada heartbeat (revisa cambios)  
**Trigger:** Variación ±10% vs día anterior

**Métricas monitoreadas:**
1. Sleep Score (±10 puntos)
2. Readiness Score (±10 puntos)
3. Activity Score (±10 puntos)
4. Sueño total (±10% horas)
5. FC mínima (±10% bpm)
6. Temperatura (±10% desviación)
7. Pasos (±10%)

**Formato de alerta:**
```
🚨 ALERTA: Métrica fuera de rango

📉 Sleep Score HOY: 52/100
    Ayer: 82/100
    Cambio: -37% ⚠️ (>10% threshold)

Posibles causas:
- Solo 3.8h de sueño (vs 8.6h ayer)
- Eficiencia baja: 85%
- ¿Algo interrumpió tu sueño?

💡 Acción sugerida:
Prioriza dormir bien hoy. Tu cuerpo necesita recuperación.
```

---

### 📊 RESUMEN SEMANAL (Domingos 10:00 PM CST)

**Frecuencia:** Semanal (domingos)  
**Trigger:** Domingo Y hora = 22:00-22:59 PM

**Acciones:**
1. Query últimos 7 días
2. Calcular estadísticas semanales
3. Comparar vs semana anterior
4. Identificar patrones
5. Generar recomendaciones
6. Enviar resumen ejecutivo

**Formato:**
```
📊 RESUMEN SEMANAL: 16-22 Marzo 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

😴 SUEÑO:
   Promedio: 7h 18m (↑22min vs semana pasada)
   Sleep Score: 78/100 (+5 vs semana pasada)
   Mejor noche: 21 marzo (82/100, 8.6h)
   Peor noche: 18 marzo (53/100, 3.8h)
   Días con >7h: 5/7 (71%)

🔋 RECUPERACIÓN:
   Readiness: 82/100 (+4 vs semana pasada)
   FC mínima: 44 bpm (↓2 vs semana pasada) ⭐
   Días con readiness >80: 4/7 (57%)

🏃 ACTIVIDAD:
   Pasos/día: 5,834 (↓890 vs semana pasada)
   Días con >10k pasos: 0/7 ⚠️
   Tiempo sedentario: 10.4h/día (↑25min)

🌡️ SALUD:
   Temperatura: Estable (+0.02°C promedio)
   Resilience: Strong 4/7 días (57%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 INSIGHTS CLAVE:

1. 🟢 Sueño mejoró +11% esta semana
   Mantén rutina de dormir antes de 11 PM

2. 🟢 FC mínima bajó 4.3% (mejor fitness)
   Cardiovascular en excelente estado

3. 🟡 Actividad física bajó 13%
   Meta próxima semana: 8k pasos/día

4. 🔴 Solo 1 día durmiendo mal (18 marzo)
   Identifica qué pasó para evitarlo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 RECOMENDACIONES PARA PRÓXIMA SEMANA:

1. Mantén >7h sueño (lo estás logrando!)
2. Aumenta pasos a 8k/día mínimo
3. Readiness >80 es tu meta (ya lo haces 4/7 días)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 SCORE DE LA SEMANA: B+ (83/100)

¡Muy buena semana! Sigue así. 💪
```

---

## ⚙️ CONFIGURACIÓN TÉCNICA

### Horarios (America/Mexico_City):
- Matutino: 08:00-08:59 AM
- Vespertino: 20:00-20:59 PM  
- Semanal: Domingos 22:00-22:59 PM

### Thresholds de Alertas:
- Variación: ±10% vs día anterior
- Aplica a: Sleep, Readiness, Activity, Horas sueño, FC, Temperatura, Pasos

### Datos de BigQuery:
- Proyecto: `YOUR_PROJECT_ID`
- Dataset: `oura_biometrics`
- Tabla: `daily_biometrics_gold`
- Credenciales: `.credentials/gcp-sa-key.json`

---

## 🔄 LÓGICA DE EJECUCIÓN

### En cada heartbeat (cada 30 min aprox):

1. **Verificar hora actual**
2. **Si 8:00-8:59 AM → Reporte matutino**
3. **Si 20:00-20:59 PM → Reporte vespertino**
4. **Si Domingo 22:00-22:59 PM → Resumen semanal**
5. **Siempre: Revisar alertas ±10%**
6. **Si nada que hacer → HEARTBEAT_OK**

---

## 📝 NOTAS

- Si datos no están disponibles (ej: día actual antes de 1 PM) → Avisar y esperar
- Alertas se disparan solo 1 vez por métrica por día (no spam)
- Resúmenes se generan automáticamente y se envían por Telegram
- Toda data se lee en tiempo real de BigQuery (siempre actualizado)
