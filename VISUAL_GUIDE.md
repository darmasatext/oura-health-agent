# 🎨 Guía Visual - Compassionate Messaging

## Dashboard Home - Insights Personalizados

```
╔═══════════════════════════════════════════════════════════════╗
║  💭 Insights Personalizados                                   ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 😊  ¡Muy bien! Tu cuerpo está respondiendo genial.     │ ║
║  │                                                          │ ║
║  │     → Mantén esta consistencia                          │ ║
║  │     → Identifica qué hiciste diferente esta semana      │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ ⭐  Excelente nivel. Sigue siendo consistente.          │ ║
║  │                                                          │ ║
║  │     → Tu cuerpo está optimizado                         │ ║
║  │     → Mantén tus hábitos actuales                       │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 👍  Estás en un buen punto. Sigue así.                  │ ║
║  │                                                          │ ║
║  │     → Mantén tu rutina de sueño                         │ ║
║  │     → Considera agregar 15 min de actividad ligera      │ ║
║  └──────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════╝
```

**Características visuales:**
- Gradiente: `from-blue-50 to-purple-50`
- Border: `border-blue-200`
- Cada card: `bg-white/80` (semi-transparente)
- Tips con bullets coloreados: azul, púrpura, verde

---

## Sleep Page - Insight Empático

```
╔═══════════════════════════════════════════════════════════════╗
║  🌱 💭 Tu Insight de Sueño                                    ║
║                                                                ║
║  Bajó un poco, pero es temporal. Pequeños ajustes ayudan.    ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Recomendaciones prácticas:                               │ ║
║  │                                                          │ ║
║  │  → Acuéstate 30 minutos más temprano hoy               │ ║
║  │  → Evita cafeína después de las 3pm                    │ ║
║  │  → Haz 10 minutos de estiramiento antes de dormir      │ ║
║  └──────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════╝
```

**Escenarios según score:**

### Score < 60 - Empático
```
╔═══════════════════════════════════════════════════════════════╗
║  💙 💭 Tu Insight de Sueño                                    ║
║                                                                ║
║  Tuviste días difíciles. Recuerda que todos pasamos por esto.║
║                                                                ║
║  Recomendaciones prácticas:                                   ║
║   → Prioriza 8 horas de sueño esta noche                     ║
║   → Evita pantallas 1 hora antes de dormir                   ║
║   → Toma una caminata de 10 minutos al aire libre            ║
╚═══════════════════════════════════════════════════════════════╝
```

### Score >= 85 - Celebratorio
```
╔═══════════════════════════════════════════════════════════════╗
║  🎉 💭 Tu Insight de Sueño                                    ║
║                                                                ║
║  ¡Increíble! Estás en tu mejor momento.                      ║
║                                                                ║
║  Recomendaciones prácticas:                                   ║
║   → Documenta tu rutina actual                               ║
║   → Comparte tu éxito (si quieres motivar a alguien)         ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Recovery Page - Insight de Recuperación

```
╔═══════════════════════════════════════════════════════════════╗
║  ⭐ 💭 Tu Insight de Recuperación                             ║
║                                                                ║
║  Excelente nivel. Sigue siendo consistente.                  ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Recomendaciones prácticas:                               │ ║
║  │                                                          │ ║
║  │  → Tu cuerpo está optimizado                            │ ║
║  │  → Mantén tus hábitos actuales                          │ ║
║  └──────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════╝
```

**Características visuales:**
- Gradiente: `from-red-50 to-pink-50`
- Border: `border-red-200`
- Bullets: `text-red-500`

---

## 🎨 Paleta de Colores por Tone

| Tone | Emoji | Color Principal | Gradiente |
|------|-------|----------------|-----------|
| Empathetic | 💙 🌱 | Blue | from-blue-50 to-purple-50 |
| Celebratory | 😊 🎉 ⭐ | Purple/Pink | from-red-50 to-pink-50 |
| Neutral | 👍 👌 | Gray | from-gray-50 to-blue-50 |

---

## 📱 Responsive Behavior

**Desktop (>768px):**
- Dashboard Home: 3 insights en columna vertical
- Sleep/Recovery: 1 insight full-width

**Mobile (<768px):**
- Todos los insights en columna vertical
- Padding reducido (p-4 en vez de p-6)
- Texto ligeramente más pequeño

---

## ♿ Accesibilidad

- ✅ Emojis con texto alternativo implícito en mensaje
- ✅ Contraste suficiente (WCAG AA+)
- ✅ Tamaños de texto legibles (base 16px)
- ✅ Focus states para navegación por teclado
- ✅ Estructura semántica (h3, ul, li)

---

## 🔄 Estados Dinámicos

Los mensajes cambian **automáticamente** según:
1. Score actual (0-100)
2. Cambio vs período anterior (%)

**Ejemplo de transición:**

```
Día 1 (score=85, change=+8)
→ 🎉 "¡Increíble! Estás en tu mejor momento."

Día 2 (score=88, change=+2)
→ ⭐ "Excelente nivel. Sigue siendo consistente."

Día 3 (score=70, change=-18)
→ 🌱 "Bajó un poco, pero es temporal. Pequeños ajustes ayudan."
```

---

**📄 Ver también:**
- `IMPLEMENTATION_SUMMARY.md` - Resumen técnico completo
- `COMPASSIONATE_MESSAGING_IMPLEMENTATION.md` - Detalles de implementación
- `lib/compassionate-messages.ts` - Código fuente
