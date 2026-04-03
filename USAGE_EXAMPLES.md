# 📘 Usage Examples: Custom Period Comparisons

## 🎯 Casos de Uso Reales

### Caso 1: Comparar Esta Semana vs Semana Pasada (WoW)
**Escenario:** Usuario quiere ver cómo le fue esta semana comparado con la anterior.

**Pasos:**
1. Ir a `/compare`
2. Por default ya está en modo "Semana vs Semana"
3. Ver métricas comparadas automáticamente

**Resultado:**
```
📊 Esta Semana vs Semana Anterior

Calidad de Sueño: 78 → 82 (+5.1%)
Recuperación: 72 → 75 (+4.2%)
Pasos Totales: 45,230 → 52,100 (+15.2%)
```

---

### Caso 2: Comparar Este Mes vs Mes Pasado (MoM)
**Escenario:** Usuario quiere análisis mensual.

**Pasos:**
1. Ir a `/compare`
2. Click en botón "Mes vs Mes"
3. Dashboard recalcula automáticamente

**Resultado:**
```
📊 Últimos 30 Días vs 30 Días Anteriores

Calidad de Sueño: 80 → 78 (-2.5%)
Horas de Sueño: 7.2h → 7.5h (+4.2%)
Actividad: 75 → 82 (+9.3%)
```

**Insight:** "Este mes 2 métricas bajaron. Prioriza descanso y recuperación."

---

### Caso 3: Comparar Vacaciones vs Trabajo (Custom)
**Escenario:** Usuario estuvo de vacaciones del 1-15 de marzo, quiere comparar con 2 semanas de trabajo.

**Pasos:**
1. Ir a `/compare`
2. Click en botón "Personalizado"
3. Configurar períodos:
   - **Período 1 (Vacaciones):**
     - Inicio: 2025-03-01
     - Fin: 2025-03-15
   - **Período 2 (Trabajo):**
     - Inicio: 2025-02-15
     - Fin: 2025-03-01
4. Click "Aplicar Comparación"

**Resultado:**
```
📊 Comparación Personalizada

Calidad de Sueño: 85 (vacaciones) vs 76 (trabajo) → +11.8%
Recuperación: 88 vs 72 → +22.2%
Pasos Totales: 65,000 vs 48,000 → +35.4%
Frecuencia Cardíaca: 48 bpm vs 52 bpm → -7.7% (mejor)
```

**Insight:** "¡Gran período! 6 métricas mejoraron significativamente vs el período anterior."

---

### Caso 4: Evaluar Impacto de Nuevo Ejercicio
**Escenario:** Usuario empezó rutina de ejercicio el 1 de marzo, quiere ver cambios.

**Pasos:**
1. Modo "Personalizado"
2. Comparar:
   - **Período 1 (Con ejercicio):** 01/03/2025 - 20/03/2025
   - **Período 2 (Antes):** 01/02/2025 - 20/02/2025
3. Aplicar

**Resultado:**
```
📊 Impacto de Ejercicio (20 días con vs sin)

✅ Mejoras:
- Actividad: 65 → 82 (+26%)
- Pasos: 5,200/día → 8,100/día (+56%)
- Recuperación: 74 → 79 (+6.8%)

❌ Tradeoffs:
- Calidad Sueño: 82 → 78 (-4.9%)
- Horas Sueño: 7.8h → 7.2h (-7.7%)

💡 Recomendación: El ejercicio aumentó actividad pero redujo sueño. 
   Considera ajustar horario de ejercicio para no afectar descanso.
```

---

### Caso 5: Comparar Fin de Semana vs Entre Semana
**Escenario:** Usuario sospecha que duerme mejor los fines de semana.

**Pasos:**
1. Modo "Personalizado"
2. Comparar:
   - **Período 1 (Fines de semana de marzo):**
     - 01-02/03, 08-09/03, 15-16/03, 22-23/03
     - Nota: Requerirá múltiples comparaciones o análisis separado
   - **Período 2 (Entre semana):**
     - 03-07/03, 10-14/03, 17-21/03

**Alternativa simple:**
- Comparar 1 semana con fin de semana vs 1 semana sin fin de semana
- O usar modo WoW/MoM y analizar patrones en gráfico

---

## 🧮 Fórmulas de Cálculo

### Week over Week (WoW)
```typescript
Período Actual: HOY - 7 días hasta HOY
Período Anterior: HOY - 14 días hasta HOY - 7 días

Ejemplo (hoy = 25/03/2025):
- Actual: 18/03 - 25/03
- Anterior: 11/03 - 18/03
```

### Month over Month (MoM)
```typescript
Período Actual: HOY - 30 días hasta HOY
Período Anterior: HOY - 60 días hasta HOY - 30 días

Ejemplo (hoy = 25/03/2025):
- Actual: 23/02 - 25/03 (30 días)
- Anterior: 24/01 - 23/02 (30 días)
```

### Custom
```typescript
Período 1: start1 hasta end1 (definido por usuario)
Período 2: start2 hasta end2 (definido por usuario)

Ejemplo:
- Período 1: 01/03 - 15/03 (15 días)
- Período 2: 01/02 - 15/02 (15 días)
```

---

## 📊 Interpretación de Resultados

### Change Percentage (% de Cambio)
```
change_pct = ((current - previous) / previous) * 100

Ejemplos:
+5.0% = Mejoró 5%
-3.2% = Empeoró 3.2%
+0.0% = Sin cambios
```

### Códigos de Color (ComparisonCard)
```
Verde (↑): change_pct > 0 (mejora)
Rojo (↓): change_pct < 0 (baja)
Gris (→): change_pct ≈ 0 (estable)
```

### Umbrales de Significancia
```
Cambio significativo: |change_pct| > 5%
Cambio moderado: 2% < |change_pct| ≤ 5%
Cambio leve: |change_pct| ≤ 2%
```

---

## 🎨 UI/UX Tips

### Mejores Prácticas

1. **Empieza con WoW:**
   - Más fácil de interpretar
   - Menos ruido que comparaciones largas

2. **Usa MoM para tendencias:**
   - Mejor para ver cambios de hábitos
   - Promedia variaciones diarias

3. **Custom para experimentos:**
   - A/B testing de rutinas
   - Evaluar impacto de cambios específicos

### Errores Comunes a Evitar

❌ **Comparar períodos desiguales**
```
Período 1: 7 días
Período 2: 30 días
→ Promedios no son comparables
```

❌ **Períodos con huecos de datos**
```
Si faltan días en el dataset, promedios se distorsionan
→ Verificar data quality primero
```

❌ **Sobreinterpretar cambios pequeños**
```
Change de +0.5% en sleep score
→ Dentro del margen de error, no es significativo
```

✅ **Mejores prácticas:**
- Comparar períodos de igual duración
- Verificar que no falten datos
- Fijarse en cambios > 5% para conclusiones

---

## 🔗 API Examples

### cURL Examples

**WoW:**
```bash
curl "http://localhost:3000/api/compare?mode=wow" | jq '.'
```

**MoM:**
```bash
curl "http://localhost:3000/api/compare?mode=mom" | jq '.'
```

**Custom:**
```bash
curl "http://localhost:3000/api/compare?mode=custom&period1Start=2025-03-01&period1End=2025-03-15&period2Start=2025-02-01&period2End=2025-02-15" | jq '.'
```

### Response Format
```json
{
  "success": true,
  "mode": "wow",
  "data": [
    {
      "metric": "Calidad de Sueño",
      "current_value": 78.5,
      "previous_value": 75.2,
      "change_pct": 4.39,
      "unit": "/100"
    },
    {
      "metric": "Recuperación",
      "current_value": 72.3,
      "previous_value": 70.1,
      "change_pct": 3.14,
      "unit": "/100"
    }
    // ... 5 more metrics
  ]
}
```

---

## 🐛 Troubleshooting

### Problema: "No data available"
**Causa:** Fechas seleccionadas sin datos en BigQuery

**Solución:**
```sql
-- Verificar rango de fechas disponibles
SELECT MIN(calendar_date), MAX(calendar_date) 
FROM `last-240000.oura_biometrics.daily_biometrics_gold`;
```

### Problema: "Change percentage is NaN"
**Causa:** previous_value es 0 o NULL

**Solución:**
- Query usa `NULLIF(p2.value, 0)` para evitar división por 0
- Si persiste, verificar data quality

### Problema: "Loading forever"
**Causa:** Query BigQuery timeout o error

**Solución:**
1. Verificar logs en `/api/compare`
2. Test query directo en BigQuery Console
3. Verificar credenciales GCP

### Problema: "Dates not updating"
**Causa:** TanStack Query cache

**Solución:**
- Cache expira automáticamente en 3-5 min
- Para forzar refresh: Reload página
- Para dev: Deshabilitar cache en devtools

---

## 📚 Referencias

- **Componente:** `/components/dashboard/PeriodSelector.tsx`
- **API Route:** `/app/api/compare/route.ts`
- **Query Logic:** `/lib/queries.ts` → `getFlexibleComparison()`
- **Page:** `/app/(dashboard)/compare/page.tsx`

**Documentación adicional:**
- `CHANGELOG_CUSTOM_PERIODS.md` - Detalles técnicos
- `TEST_CHECKLIST.md` - Testing guide
- `IMPLEMENTATION_SUMMARY.md` - Executive summary

---

**Última actualización:** 2025-03-25  
**Versión:** 1.0.0
