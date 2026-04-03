# 📱 Mobile Responsive Layout - Visualización

## 📐 Comparación Visual por Viewport

---

## 📱 MOBILE (375px - iPhone SE)

### Navigation:
```
┌────────────────────────────────────┐
│ Dashboard Oura          ☰          │ ← Hamburger menu
└────────────────────────────────────┘
```

**Cuando se abre el menu:**
```
┌────────────────────────────────────┐
│ Dashboard Oura          ✕          │
├────────────────────────────────────┤
│ 🏠 Inicio                          │ ← 48px altura
├────────────────────────────────────┤
│ 🌙 Sueño                           │
├────────────────────────────────────┤
│ ⚡ Actividad                        │
├────────────────────────────────────┤
│ ❤️  Recuperación                    │
├────────────────────────────────────┤
│ ✨ Análisis                         │
├────────────────────────────────────┤
│ 📈 Comparar                         │
└────────────────────────────────────┘
```

### MetricCards (Stack vertical):
```
┌────────────────────────────────────┐
│ Calidad de Sueño               🌙  │
│                                    │
│ 78  /100                           │ ← 3xl (28px)
│ +5.2% vs semana anterior           │
│ Promedio últimos 7 días            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Nivel de Recuperación          ❤️  │
│                                    │
│ 72  /100                           │
│ -2.1% vs semana anterior           │
│ Qué tan listo está tu cuerpo       │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Actividad Física               ⚡  │
│ ...                                │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Pasos Diarios                  📈  │
│ ...                                │
└────────────────────────────────────┘
```

### DateSelector (Stack vertical):
```
┌────────────────────────────────────┐
│ ┌────────────┬────────────┬──────┐ │
│ │ Últimos    │ Últimos    │Últim │ │ ← Flex wrap
│ │ 7 días     │ 30 días    │90 dí │ │   44px altura
│ └────────────┴────────────┴──────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 📅 15 Mar - 22 Mar 2026        │ │ ← Full width
│ └────────────────────────────────┘ │   44px altura
└────────────────────────────────────┘
```

### Chart (250px altura):
```
┌────────────────────────────────────┐
│  10h ─                             │
│   9h ─  ▓▓                         │
│   8h ─  ▓▓ ▓▓                      │
│   7h ─  ▓▓ ▓▓ ▓▓                   │ ← 250px
│   6h ─  ▓▓ ▓▓ ▓▓ ▓▓                │
│        Lu Ma Mi Ju Vi Sa Do        │
│         ↖ Labels -45°              │
│         (11px)                     │
└────────────────────────────────────┘
```

---

## 📱 TABLET (768px - iPad Portrait)

### Navigation:
```
┌────────────────────────────────────────────────────────┐
│ Oura Dashboard   🏠 Inicio  🌙 Sueño  ⚡ Actividad ... │ ← Horizontal
└────────────────────────────────────────────────────────┘
```

### MetricCards (2 columnas):
```
┌─────────────────────────┬─────────────────────────┐
│ Calidad de Sueño   🌙  │ Recuperación       ❤️  │
│                         │                         │
│ 78  /100                │ 72  /100                │
│ +5.2% vs anterior       │ -2.1% vs anterior       │
└─────────────────────────┴─────────────────────────┘

┌─────────────────────────┬─────────────────────────┐
│ Actividad          ⚡  │ Pasos             📈  │
│ ...                     │ ...                     │
└─────────────────────────┴─────────────────────────┘
```

### DateSelector (Horizontal):
```
┌────────────────────────────────────────────────────────┐
│ ┌────────┐ ┌────────┐ ┌────────┐  o  ┌──────────────┐ │
│ │Últimos │ │Últimos │ │Últimos │     │📅 15-22 Mar  │ │
│ │7 días  │ │30 días │ │90 días │     │              │ │
│ └────────┘ └────────┘ └────────┘     └──────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Chart (350px altura):
```
┌────────────────────────────────────────────────────────┐
│  10h ─                                                 │
│   9h ─  ▓▓▓                     ← Referencia 9h       │
│   8h ─  ▓▓▓ ▓▓▓                                        │
│   7h ─  ▓▓▓ ▓▓▓ ▓▓▓             ← Referencia 7h       │ ← 350px
│   6h ─  ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓                                │
│        Lun  Mar  Mié  Jue  Vie  Sáb  Dom              │
│        (Labels horizontales - 14px)                    │
└────────────────────────────────────────────────────────┘
```

---

## 💻 DESKTOP (1024px+)

### Navigation:
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Oura Dashboard      🏠 Inicio  🌙 Sueño  ⚡ Actividad  ❤️ Recuperación ... │
└──────────────────────────────────────────────────────────────────────────┘
```

### MetricCards (4 columnas):
```
┌────────────┬────────────┬────────────┬────────────┐
│ Sueño  🌙 │ Recup  ❤️ │ Act   ⚡  │ Pasos 📈  │
│            │            │            │            │
│ 78  /100   │ 72  /100   │ 85  /100   │ 12,345     │
│ +5.2%      │ -2.1%      │ +8.5%      │ +12.3%     │
└────────────┴────────────┴────────────┴────────────┘
```

### DateSelector (Horizontal expandido):
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────┐ ┌──────────┐  o  ┌─────────────────────────┐ │
│ │ Últimos  │ │ Últimos  │ │ Últimos  │     │ 📅 15 Mar - 22 Mar 2026 │ │
│ │ 7 días   │ │ 30 días  │ │ 90 días  │     │ Personalizar fechas     │ │
│ └──────────┘ └──────────┘ └──────────┘     └─────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### Chart (350px altura - BarChart):
```
┌──────────────────────────────────────────────────────────────────────────┐
│                         7.8h  8.2h  7.5h  8.1h                           │
│  10h ─                                                                   │
│   9h ─  ▓▓▓▓▓          ────────────────── Máximo recomendado (9h)      │
│   8h ─  ▓▓▓▓▓  ▓▓▓▓▓    ▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓                             │
│   7h ─  ▓▓▓▓▓  ▓▓▓▓▓    ▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓ ────── Mínimo (7h)          │
│   6h ─  ▓▓▓▓▓  ▓▓▓▓▓    ▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓                       │
│        Lunes  Martes  Miércoles  Jueves  Viernes  Sábado  Domingo      │
│        (Labels horizontales con valores - 14px)                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### RadarChart (500px):
```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                            Calidad Sueño                                 │
│                                  /\                                      │
│                                 /  \                                     │
│            Temperatura        /      \        Pasos                      │
│                    \        /          \        /                        │
│                     \      /            \      /                         │
│                      \    /              \    /                          │
│                       \  /                \  /                           │ ← 500px
│         Frecuencia ───────────────────────────── Recuperación            │
│              FC         /                  \        HRV                  │
│                        /                    \                            │
│                       /                      \                           │
│                                                                          │
│                          Actividad                                       │
│                                                                          │
│         ■ Esta Semana (azul)    ■ Semana Anterior (verde)               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Diferencias Clave por Viewport

### Mobile (< 768px):
- ✅ Hamburger menu (☰/✕)
- ✅ Cards: 1 columna vertical
- ✅ Charts: 250px altura
- ✅ Labels rotados -45°
- ✅ Font sizes reducidos (11px-14px)
- ✅ DateSelector stack vertical
- ✅ No reference lines en charts
- ✅ Touch targets 44px+

### Tablet (768-1023px):
- ✅ Nav horizontal
- ✅ Cards: 2 columnas
- ✅ Charts: 350px altura
- ✅ Labels horizontales
- ✅ Font sizes normales (12px-14px)
- ✅ DateSelector horizontal
- ✅ Reference lines visibles

### Desktop (≥ 1024px):
- ✅ Nav horizontal expandido
- ✅ Cards: 4 columnas
- ✅ Charts: 350px-500px altura
- ✅ Labels horizontales con valores
- ✅ Font sizes grandes (14px-16px)
- ✅ Reference lines + tooltips completos
- ✅ Spacing generoso

---

## 📊 Typography Scale Comparison

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| html base | 14px | 16px | 16px |
| h1 | 1.75rem (24.5px) | 2rem (32px) | 2rem (32px) |
| h2 | 1.5rem (21px) | 1.5rem (24px) | 1.5rem (24px) |
| Metric value | 2rem (28px) | 2.5rem (40px) | 2.5rem (40px) |
| Chart tick | 11px | 12px | 14px |
| Button text | 14px | 16px | 16px |

---

## 🎨 Grid Layout Comparison

### Mobile (< 768px):
```
┌──────────┐
│ Card 1   │
├──────────┤
│ Card 2   │
├──────────┤
│ Card 3   │
├──────────┤
│ Card 4   │
└──────────┘
```

### Tablet (768-1023px):
```
┌─────────┬─────────┐
│ Card 1  │ Card 2  │
├─────────┼─────────┤
│ Card 3  │ Card 4  │
└─────────┴─────────┘
```

### Desktop (≥ 1024px):
```
┌─────┬─────┬─────┬─────┐
│ C1  │ C2  │ C3  │ C4  │
└─────┴─────┴─────┴─────┘
```

---

## 🔍 Detalles de Implementación

### Navigation Drawer Animation (CSS):
```
Closed:  ☰ (Menu icon)
↓
Open:    ✕ (X icon) + Drawer aparece desde arriba
↓
Click:   Drawer se cierra smoothly
```

### Chart Adaptation Logic:
```javascript
const isMobile = window.innerWidth < 768;

height={isMobile ? 250 : 350}
angle={isMobile ? -45 : 0}
fontSize={isMobile ? 11 : 14}

// Mobile: Compacto, labels rotados, sin clutter
// Desktop: Espacioso, labels horizontales, annotations completas
```

### Touch Target Guidelines (WCAG):
```
Minimum:   44x44px  (buttons, links)
Ideal:     48x48px  (navigation links)
Spacing:   8px gap  (between interactive elements)

✅ Todos nuestros botones cumplen el mínimo de 44px
✅ Nav links tienen 48px de altura (más fácil de presionar)
```

---

## ✅ Testing Checklist Visual

### Mobile (375px):
- [ ] ☰ Hamburger visible y clickeable
- [ ] Drawer se abre completo
- [ ] Cards ocupan todo el ancho
- [ ] No scroll horizontal
- [ ] Charts caben sin scroll
- [ ] Botones fáciles de presionar con pulgar

### Tablet (768px):
- [ ] Nav horizontal visible
- [ ] Cards en 2 columnas balanceadas
- [ ] Charts se ven completos
- [ ] DateSelector en 1 línea

### Desktop (1024px):
- [ ] Nav completo horizontal
- [ ] Cards en 4 columnas
- [ ] Charts grandes con annotations
- [ ] Spacing generoso

---

**Documento generado para visualizar layouts responsive**

**Dashboard:** oura-dashboard
**Fecha:** 2026-03-25
