# User Guide - Filtros Interactivos del Dashboard

**Versión:** 2.0 (Post-migración Gold)  
**Última actualización:** 27 marzo 2026

---

## 🎯 ¿Qué son los filtros interactivos?

Los filtros interactivos te permiten **analizar tus métricas de salud en diferentes períodos de tiempo** sin tener que esperar queries lentos o navegar por múltiples páginas.

**Beneficios:**
- ✅ Cambios instantáneos entre períodos (7, 30, 90 días)
- ✅ Comparación automática vs período anterior
- ✅ Datos actualizados en tiempo real
- ✅ Funciona en todas las páginas del dashboard

---

## 📱 Cómo Usar los Filtros

### Ubicación
Los filtros están en la **parte superior derecha** de cada página del dashboard:

```
┌─────────────────────────────────────────────────┐
│  Dashboard de Salud              [Filtros ▼]   │
│  Viernes, 27 de marzo de 2026                  │
└─────────────────────────────────────────────────┘
```

### Opciones Disponibles

#### 1️⃣ Períodos Rápidos (Quick filters)
- **Últimos 7 días** - Tu semana actual
- **Últimos 30 días** - Tu mes reciente
- **Últimos 90 días** - Tus últimos 3 meses

**Cómo usar:**
1. Haz clic en el botón de filtros
2. Selecciona el período deseado
3. Los datos se actualizan automáticamente

#### 2️⃣ Rango Personalizado (Custom range)
- Selecciona fechas de inicio y fin específicas
- Útil para analizar períodos específicos (ej: vacaciones, cambio de rutina)

**Cómo usar:**
1. Haz clic en "Personalizado"
2. Selecciona fecha de inicio
3. Selecciona fecha de fin
4. Haz clic en "Aplicar"

---

## 📊 Qué Cambia Cuando Filtras

### KPIs Principales (Home Page)
Todas estas métricas se actualizan según el período seleccionado:

**🌙 Calidad de Sueño**
- Valor: Promedio del período
- Delta %: Comparación vs período anterior
- Ejemplo: "Últimos 7 días" compara vs "7 días previos"

**❤️ Nivel de Recuperación**
- Valor: Promedio del período
- Delta %: Cambio vs período anterior

**🏃 Actividad Física**
- Valor: Promedio del período
- Delta %: Cambio vs período anterior

**👟 Pasos Diarios**
- Valor: Promedio del período
- Sin delta (valor absoluto)

### Insight del Período
El insight automático **se adapta al período seleccionado**:

```
Período 7 días:
"Tu sueño mejoró 8% en los últimos 7 días. ¡Excelente trabajo!"

Período 30 días:
"Tu sueño mejoró 8% en el último mes. ¡Excelente trabajo!"
```

### Health Insights Widgets
Los widgets de HRV, Sleep Scorecard y Recovery Factors **también responden a los filtros**:

- **HRV Alert:** Muestra datos del último día del período
- **Sleep Scorecard:** Promedio del período + checks acumulados
- **Recovery Factors:** Datos del último día

---

## 🎨 Ejemplos de Uso

### Caso 1: Revisar tu semana
**Objetivo:** Ver cómo dormiste esta semana vs la anterior

**Pasos:**
1. Abre Dashboard (ya está en "Últimos 7 días" por defecto)
2. Observa los KPIs
3. Fíjate en los deltas % (verde = mejora, rojo = empeoramiento)

**Interpretación:**
```
Calidad de Sueño: 78 ↑ +5%
→ Dormiste 5% mejor esta semana vs la anterior
```

---

### Caso 2: Analizar un mes completo
**Objetivo:** Ver tu progreso mensual

**Pasos:**
1. Haz clic en filtros
2. Selecciona "Últimos 30 días"
3. Espera 1-2 segundos (actualización automática)

**Qué obtienes:**
- Promedio de 30 días
- Comparación vs 30 días previos
- Insights de tendencias más amplias

---

### Caso 3: Comparar vacaciones vs trabajo
**Objetivo:** Ver cómo cambió tu salud en vacaciones

**Pasos:**
1. Haz clic en filtros → "Personalizado"
2. Selecciona tus fechas de vacaciones (ej: 1-14 marzo)
3. Nota los valores
4. Cambia a período laboral (ej: 15-28 marzo)
5. Compara resultados

**Ejemplo:**
```
Vacaciones (1-14 marzo):
  Sueño: 85, Recuperación: 88, Actividad: 65

Trabajo (15-28 marzo):
  Sueño: 72, Recuperación: 78, Actividad: 82

Conclusión: Dormiste mejor de vacaciones, pero fuiste más activo trabajando
```

---

### Caso 4: Revisar trimestre completo
**Objetivo:** Ver tu progreso a largo plazo

**Pasos:**
1. Selecciona "Últimos 90 días"
2. Analiza tendencias generales
3. Identifica patrones estacionales

**Nota:** Necesitas al menos 90 días de datos históricos.

---

## 🔍 Interpretación de Resultados

### Deltas (%)
El símbolo junto al porcentaje indica la dirección del cambio:

- **↑ +5%** (verde) = Mejoraste 5% vs período anterior
- **↓ -3%** (rojo) = Empeoraste 3% vs período anterior
- **→ 0%** (gris) = Sin cambio significativo

### Contexto del Período
Debajo de cada KPI verás el contexto:

```
Promedio últimos 7 días
Promedio último mes
Promedio 3 meses
```

Esto te ayuda a interpretar correctamente los valores.

---

## 💡 Tips y Mejores Prácticas

### ✅ DO's (Haz esto)
1. **Usa 7 días para análisis semanal** - Detecta cambios recientes
2. **Usa 30 días para tendencias mensuales** - Ve el panorama general
3. **Usa 90 días para metas a largo plazo** - Identifica progreso real
4. **Compara períodos similares** - Ej: lunes vs lunes (no lunes vs sábado)
5. **Nota los insights automáticos** - Te dan contexto relevante

### ❌ DON'Ts (Evita esto)
1. **No compares períodos muy diferentes** - 7 días vs 90 días no es útil
2. **No ignores el contexto** - Un día malo en 7 días impacta más que en 30
3. **No sobre-optimices** - Cambios <5% son normales (ruido)
4. **No uses solo un período** - Combina corto y largo plazo
5. **No te obsesiones con deltas diarios** - Ve tendencias, no picos

---

## 🎓 Casos de Uso Avanzados

### Identificar Patrones de Fin de Semana

**Pregunta:** ¿Duermo peor los fines de semana?

**Método:**
1. Filtra "Últimos 30 días"
2. Ve a página **Insights** → "Performance por Día de la Semana"
3. Observa heatmap: Sábado y Domingo vs Lunes-Viernes
4. Compara promedios

---

### Detectar Impacto de Cambios de Hábitos

**Pregunta:** ¿Me ayudó empezar a meditar hace 2 semanas?

**Método:**
1. Filtra "Personalizado" → Últimas 2 semanas (con meditación)
2. Nota tu promedio de recuperación
3. Cambia a "Personalizado" → 2 semanas previas (sin meditación)
4. Compara promedios
5. Si mejoraste >10%, la meditación probablemente ayudó

---

### Validar Días Perfectos

**Pregunta:** ¿Qué días fueron "perfectos" este mes?

**Método:**
1. Filtra "Últimos 30 días"
2. Ve a página **Insights** → "Días Perfectos Detectados"
3. Analiza qué días lograste sueño ≥80, recuperación ≥80, actividad ≥75
4. Busca patrones comunes (día de la semana, actividades)

---

## 📐 Limitaciones y Consideraciones

### Datos Mínimos Requeridos
| Período | Mínimo de días | Recomendado |
|---------|----------------|-------------|
| 7 días | 5 días | 7 días completos |
| 30 días | 20 días | 28-30 días |
| 90 días | 60 días | 85-90 días |

**Si no hay suficientes datos:**
- El dashboard mostrará "No hay datos suficientes"
- Los deltas pueden no ser precisos
- Algunos widgets no se mostrarán

### Actualización de Datos
- **Frecuencia:** Cada 30 minutos (sincronización Oura → BigQuery → Vistas Gold)
- **Latencia:** 0-2 minutos
- **Cache:** Los datos se cachean 2 minutos en el navegador

**¿Qué hacer si los datos no actualizan?**
1. Espera 2 minutos
2. Refresca la página (F5)
3. Verifica que tu Oura Ring sincronizó

---

## 🐛 Troubleshooting

### Problema 1: "No se pudieron cargar los datos"
**Causa:** Error de conexión a BigQuery o servidor caído

**Solución:**
1. Refresca la página
2. Verifica tu conexión a internet
3. Si persiste, contacta soporte

---

### Problema 2: Datos desactualizados
**Causa:** Cache del navegador

**Solución:**
1. Refresca la página (Ctrl+F5 / Cmd+Shift+R)
2. Espera 2 minutos (staleTime)
3. Si persiste, limpia cache del navegador

---

### Problema 3: Período 90 días sin datos
**Causa:** No hay suficiente histórico

**Solución:**
1. Espera a acumular 90 días de datos
2. Usa 30 días mientras tanto
3. Consulta "Data availability" en Settings

---

### Problema 4: Deltas extraños (ej: +500%)
**Causa:** Datos incompletos en período de comparación

**Solución:**
1. Verifica que ambos períodos tienen datos completos
2. Si acabas de empezar a usar Oura, los primeros días pueden tener deltas raros
3. Ignora deltas si no hay suficiente histórico

---

## 📱 Soporte Mobile

### Responsive Design
El dashboard funciona en móviles, pero algunas features están optimizadas para desktop:

**Mobile:**
- ✅ Filtros funcionan perfectamente
- ✅ KPIs se ven bien
- ⚠️ Heatmaps se ven mejor en landscape
- ⚠️ Gráficas de correlación mejor en tablet+

**Recomendación:** Usa desktop para análisis profundos, mobile para checks rápidos.

---

## 🔐 Privacidad y Seguridad

- ✅ Tus datos **no se comparten** con terceros
- ✅ Filtros funcionan **localmente** (no se envían a servidores externos)
- ✅ Queries a BigQuery usan **credenciales seguras**
- ✅ Dashboard solo accesible con **autenticación**

---

## 🚀 Próximas Features

### En desarrollo
- [ ] Guardar filtros favoritos
- [ ] Comparar 2 períodos lado a lado
- [ ] Exportar datos del período seleccionado (CSV)
- [ ] Alertas cuando mejoras >10% en un período

### Propuestas
- [ ] Filtros por día de la semana (solo lunes, solo fines de semana)
- [ ] Filtros por categorías (solo días con ejercicio, solo días con >8h sueño)
- [ ] Predicciones basadas en períodos históricos

**¿Tienes sugerencias? Contáctanos.**

---

## 📚 Recursos Adicionales

- [Migration Report](./MIGRATION_REPORT.md) - Detalles técnicos de la migración
- [Performance Comparison](./PERFORMANCE_COMPARISON.md) - Benchmarks de velocidad
- [Integration Tests](./INTEGRATION_TESTS.md) - Tests ejecutados
- [API Documentation](./API.md) - Endpoints disponibles

---

## 📞 Soporte

**¿Necesitas ayuda?**
- 📧 Email: [tu-email@ejemplo.com]
- 💬 Discord: [Link al servidor]
- 🐛 Bug reports: [GitHub Issues]

---

**Guía creada por:** Subagent Dashboard Updater  
**Para usuarios de:** Oura Dashboard v2.0  
**Última actualización:** 27 marzo 2026
