# User Journey Map - Diego (60 años, activo)

## Persona

**Nombre:** Diego  
**Edad:** 60 años  
**Perfil:** Activo, cuida su salud, usuario de Oura Ring  
**Tech savviness:** Medio (usa smartphone, apps básicas)  
**Objetivo:** Monitorear salud proactivamente y mejorar hábitos

---

## Journey Completo

### 🔍 FASE 1: DESCUBRIMIENTO

**Contexto:**
- Diego paga $5.99/mes por Oura Membership
- Busca alternativa gratuita en Google: "oura ring dashboard"
- Encuentra repo GitHub o URL del dashboard

**Canales:**
- Búsqueda orgánica
- Recomendación de amigo
- Comunidad Oura en Reddit

**Emoción:** Curioso 😐 → Interesado 🙂

**Touchpoints:**
- Google search results
- GitHub README
- Landing page (primera impresión)

**Pain Points:**
- ❌ No sabe si es confiable (¿quién lo hizo?)
- ❌ No sabe si sus datos están seguros
- ❌ URL desconocida (no .com oficial)

**Wow Moments:**
- ✅ "¡Es gratis vs $5.99/mes!"
- ✅ Loading rápido (<2s)
- ✅ Diseño limpio (no ads)

**Acciones:**
- Click en link
- Espera que cargue
- Primera impresión visual

**Tiempo:** 30 segundos - 2 minutos

---

### 🚪 FASE 2: PRIMERA VISITA

**Contexto:**
- Entra al dashboard sin instrucciones
- No sabe qué esperar
- Ve 4 tarjetas con números

**Emoción:** Confundido 😕 → Curioso 🤔

**Touchpoints:**
- Landing en `/` (home)
- 4 KPI cards: 78, 82, 75, 7,845
- Navigation bar con 6 opciones

**Pain Points:**
- ❌ No hay tour guiado (¿por dónde empiezo?)
- ❌ No entiende qué significan los números
- ❌ No sabe para qué sirve cada sección
- ❌ No ve su nombre (se siente genérico)

**Wow Moments:**
- ✅ Reconoce iconos (Luna, Corazón, Actividad)
- ✅ Fecha en español con día de semana
- ✅ Diseño grande y legible

**Acciones:**
- Scroll por la página
- Hover sobre tarjetas (esperando tooltips)
- Click en "Sueño" (tema que más le interesa)

**Tiempo:** 1-3 minutos

---

### 🔭 FASE 3: EXPLORACIÓN

**Contexto:**
- Visita cada página para entender qué hay
- Busca sus datos personales
- Explora gráficas

**Emoción:** Curioso 🤔 → Satisfecho 🙂 → Impresionado 😮

**Touchpoints:**

#### `/sleep` - Análisis de Sueño
- Ve gráfica de barras (últimos 7 días)
- Lee "Sueño de sueños: 1.2h"
- Encuentra explicación: "Fase donde sueñas y tu cerebro procesa recuerdos"
- **Emoción:** "¡Ah! Esto es REM sleep. Entiendo." 🙂

#### `/recovery` - Recuperación
- Ve "Latidos cuando descansas: 45 bpm"
- Lee explicación de HRV: "Variabilidad del ritmo cardíaco"
- **Emoción:** "Interesante, mi corazón es flexible" 🤔

#### `/activity` - Actividad
- Ve contador gigante de pasos: "7,845"
- Barra de progreso hacia meta (8,000)
- **Emoción:** "¡Casi llego a mi meta!" 😊

#### `/insights` - Análisis
- Descubre "Días Perfectos" (concepto nuevo)
- Ve heatmap de días de semana
- Encuentra correlación Sueño → Recuperación
- **Emoción:** "¡WOW! Mi mejor día es sábado" 😮

#### `/compare` - Comparar
- Compara esta semana vs anterior
- Ve radar chart (bonito pero confuso)
- Lee: "Sueño mejoró 12%"
- **Emoción:** "Esto es útil para ver tendencias" 🙂

**Pain Points:**
- ❌ Insights interesantes pero no accionables
- ❌ Radar chart confuso (no sabe leerlo)
- ❌ Mucha información en `/insights` (overwhelming)

**Wow Moments:**
- ✅ "Días Perfectos" es concepto motivador
- ✅ Correlación Sueño-Recuperación es reveladora
- ✅ Gráficas claras (barras grandes, no líneas complejas)
- ✅ Lenguaje simple en TODAS las páginas

**Acciones:**
- Explora todas las 6 páginas
- Lee explicaciones
- Compara sus datos con rangos normales

**Tiempo:** 10-15 minutos (primera exploración completa)

**Decisión:** "Esto es útil, voy a volver mañana para ver mis datos nuevos"

---

### 🔄 FASE 4: USO REGULAR

**Contexto:**
- Diego vuelve 1-2 veces/día
- Mañana: Ver cómo durmió anoche
- Noche: Revisar actividad del día

**Emoción:** Varía según datos 🙂😞😊

**Patrón típico (sesión matutina):**

#### Día con datos Buenos (Sueño 85, Recuperación 90)
```
1. Abre dashboard → Va directo a /
2. Ve Sueño: 85 (verde) → 😊 "¡Bien!"
3. Ve Recuperación: 90 (verde) → 😊 "Excelente"
4. Lee insight: "Tu sueño mejoró 12% esta semana"
5. Piensa: "¿Y qué hago ahora?" 🤔
6. Cierra dashboard (no hay next action)
```

**Pain Point:** No hay celebración de victoria ni próxima acción

#### Día con datos Malos (Sueño 55, Recuperación 60)
```
1. Abre dashboard → Ve Sueño: 55 (rojo)
2. Emoción: 😞 "Oh no..."
3. Lee insight: "Tu sueño bajó 15% vs semana pasada"
4. Emoción: 😞😞 "Me siento peor ahora"
5. No ve consejos accionables
6. Cierra dashboard frustrado → Puede no volver
```

**Pain Point CRÍTICO:** Tone negativo sin empatía → Riesgo de abandono

**Patrón típico (sesión nocturna):**
```
1. Abre dashboard → Va a /activity
2. Ve pasos: 9,200 → 😊 "¡Superé mi meta!"
3. Va a /compare para ver vs ayer
4. Ve que caminó +15% más
5. Se siente motivado → "Mañana intento 10,000"
```

**Wow Moment:** Comparaciones semanales motivan

**Frecuencia esperada:**
- Días buenos: 7 visitas/semana
- Días malos: 3 visitas/semana (evita ver datos negativos)

**Tiempo promedio:** 2-5 minutos/sesión

**Triggers para volver:**
- ✅ Curiosidad: "¿Cómo dormí?"
- ✅ Comparación: "¿Mejoré vs ayer?"
- ❌ NO hay notificaciones push
- ❌ NO hay email summaries
- ❌ NO hay gamificación ("vuelve para racha")

---

### 🏆 FASE 5: RETENCIÓN vs CHURN

#### Escenario A: Usuario SE QUEDA (40% probabilidad)

**Perfil:**
- Curioso, disciplinado, le gustan los datos
- No necesita motivación externa
- Disfruta trackear métricas por sí solo

**Razones para quedarse:**
- "Me gusta ver mis patrones"
- "Es gratis vs Oura app"
- "Entiendo mejor mi salud"
- "Las correlaciones son interesantes"

**Frecuencia:** 5-7 visitas/semana (consistente)

**Comportamiento:**
- Revisa dashboard cada mañana (hábito)
- Explora /insights cada semana
- Compara períodos mensualmente
- Exporta datos ocasionalmente (si feature existe)

**Lifetime value:** Usuario fiel (6+ meses)

---

#### Escenario B: Usuario ABANDONA (60% probabilidad ⚠️)

**Perfil:**
- Casual, busca motivación externa
- Necesita gamificación o social proof
- Se desmotiva con datos negativos

**Razones para abandonar:**
1. **Semana 1:** "Es interesante pero no me da acciones claras"
2. **Semana 2:** Tiene 3 días malos seguidos → Tone negativo → Se siente culpable
3. **Semana 3:** "Ya sé que duermo mal, ¿y ahora qué?"
4. **Semana 4:** Frecuencia baja a 2 visitas/semana
5. **Semana 5:** Churn completo (no vuelve)

**Triggers del abandono:**
- ❌ No hay hooks emocionales (logros, badges)
- ❌ Insights no accionables
- ❌ Tone culpabilizador en malos días
- ❌ No comunidad (siente que está solo)
- ❌ Olvida volver (no hay notificaciones)

**Tiempo hasta churn:** 2-4 semanas

**Emoción final:** Indiferencia 😐 → "No lo necesito"

---

## Momentos Críticos (Make-or-Break)

### ✅ Momento 1: Primera Impresión (0-30 segundos)
**Pregunta del usuario:** "¿Qué es esto? ¿Vale la pena?"

**Actual:**
- Ve números sin contexto
- No hay value proposition

**Ideal:**
- Modal de bienvenida
- Tour guiado de 3 pasos
- Value prop claro: "Entiende tu salud de forma simple"

**Impacto si se arregla:** Engagement +30%

---

### ✅ Momento 2: Primer Día Malo (semana 1-2)
**Pregunta del usuario:** "Mi sueño bajó. ¿Soy un fracaso?"

**Actual:**
- "Tu sueño bajó 15%" (tone acusatorio)
- No hay empatía ni consejos

**Ideal:**
- "Tuviste una semana difícil, es normal 💙"
- Tips accionables: "Acuéstate 30 min más temprano"
- Contexto: "55 es regular, no desastroso"

**Impacto si se arregla:** Retention +25%, Churn -15%

---

### ✅ Momento 3: Primera Victoria (semana 2-3)
**Pregunta del usuario:** "¡Logré mi meta! ¿Alguien lo nota?"

**Actual:**
- Dashboard no celebra
- Datos cambian pero sin feedback especial

**Ideal:**
- Alert: "🎉 ¡Día Perfecto! Todas tus métricas excelentes"
- Badge desbloqueado: "Primer Día Perfecto"
- Insight: "¡Sigue así! Replica lo que hiciste ayer"

**Impacto si se arregla:** Satisfaction +20%, Loyalty +15%

---

### ✅ Momento 4: Decisión de Retención (semana 3-4)
**Pregunta del usuario:** "¿Vale la pena seguir usando esto?"

**Actual:**
- No hay reason to return (solo datos)
- No hay gamificación
- No hay comunidad

**Ideal:**
- Progress tracking: "3/10 Días Perfectos este mes"
- Rachas visibles: "🔥 Racha de 7 días checando dashboard"
- Email semanal (opcional): "Tu resumen de la semana"

**Impacto si se arregla:** Retention +20%, Churn -20%

---

## Pain Points por Severidad

### 🔴 Críticos (causa abandono)

1. **Tone negativo en días malos**
   - "Bajó 15%" sin empatía
   - Usuario se siente culpable → Abandona

2. **Zero onboarding**
   - Primera visita confusa
   - No sabe qué hacer → Alta probabilidad de bounce

3. **Insights no accionables**
   - "Tu sueño mejoró 12%" → ¿Y?
   - Usuario no sabe qué hacer con la info

---

### 🟡 Altos (frustran pero no causan churn inmediato)

4. **No retention triggers**
   - No hay razón para volver mañana
   - Olvida el dashboard después de 2 semanas

5. **Mobile UX pobre**
   - Charts se ven mal en pantalla pequeña
   - Navigation ocupa mucho espacio

6. **No help system**
   - Usuario de 60 años se pierde
   - No sabe a quién preguntar

---

### 🟢 Medios (mejoras de experiencia)

7. **Dashboard se siente clínico**
   - No personalización (nombre, avatar)
   - Tone distante, no empático

8. **Comparaciones sin interpretación**
   - Radar chart bonito pero confuso
   - No auto-analysis de cambios

---

## Wow Moments

### 🌟 Actuales (ya existen)

1. **"¡Es gratis!"**
   - $0 vs $5.99/mes de Oura
   - Momento: Descubrimiento

2. **Lenguaje simple**
   - "Sueño de sueños" vs "REM"
   - Momento: Exploración (/sleep)

3. **Correlación Sueño-Recuperación**
   - "¡Por eso me siento mejor cuando duermo bien!"
   - Momento: Exploración (/insights)

4. **Días Perfectos**
   - Concepto nuevo y motivador
   - Momento: Exploración (/insights)

---

### ⭐ Potenciales (si se implementan)

5. **Celebration de victorias**
   - "🎉 Día Perfecto! Todas excelentes"
   - Momento: Uso regular (día bueno)

6. **Compassionate messaging**
   - "Es normal tener días difíciles 💙"
   - Momento: Uso regular (día malo)

7. **Logros desbloqueados**
   - "🏆 Racha de 7 días"
   - Momento: Retención (semana 1-2)

---

## Recomendaciones por Fase

### FASE 1 (Descubrimiento)
✅ **Implementar:**
- About page: "¿Qué es? ¿Quién lo hizo? ¿Es seguro?"
- Value prop en meta description (SEO)
- Testimonial simple: "Me ayudó a entender mi sueño mejor - Diego, 60"

---

### FASE 2 (Primera visita)
✅ **Implementar (CRÍTICO):**
- Onboarding modal (3 steps)
- Value prop hero text
- Help icon en navigation

---

### FASE 3 (Exploración)
✅ **Implementar:**
- Tooltips en métricas
- Progressive disclosure en /insights (tabs)
- ChartExplanation en gráficas complejas

---

### FASE 4 (Uso regular)
✅ **Implementar (CRÍTICO):**
- Compassionate messaging (días malos)
- Celebration (días buenos)
- Insights accionables (next steps)

---

### FASE 5 (Retención)
✅ **Implementar:**
- Gamificación ligera (badges)
- Progress tracking visible
- Email semanal (opcional)

---

## Métricas de Éxito

### Pre-Implementation (Actual estimado)
- First-visit bounce: ~40%
- D7 retention: ~45%
- D30 retention: ~25%
- Avg session duration: 2-3 min
- Churn rate: ~60% en mes 1

### Post-Implementation (Proyectado)
- First-visit bounce: ~25% (-15%)
- D7 retention: ~65% (+20%)
- D30 retention: ~50% (+25%)
- Avg session duration: 4-6 min (+2 min)
- Churn rate: ~35% en mes 1 (-25%)

---

**Documento creado:** 25 marzo 2026, 02:00 CST  
**Basado en:** UX/CX Holistic Audit  
**Usuario target:** Diego, 60 años, activo
