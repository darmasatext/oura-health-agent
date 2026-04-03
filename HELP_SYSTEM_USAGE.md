# Help System - Usage Guide

Guía rápida para agregar tooltips y modals de ayuda en nuevas páginas o componentes.

---

## 🔧 Componentes Disponibles

### 1. HelpTooltip
Tooltip pequeño con icono `?` para explicaciones breves.

### 2. HelpModal
Modal completo para guías detalladas.

### 3. helpContent
Biblioteca de contenido de ayuda (11 entries).

---

## 📝 Cómo Usar

### HelpTooltip - Explicación breve al lado de métricas

```tsx
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { helpContent } from '@/lib/help-content';

// En un título de métrica
<div className="flex items-center gap-2">
  <h3>Calidad de Sueño</h3>
  <HelpTooltip content={helpContent.sleepScore.short} />
</div>

// Con lado personalizado
<HelpTooltip 
  content="Explicación breve aquí" 
  side="right" 
/>
```

**Cuándo usar:**
- ✅ Junto a nombres de métricas (en títulos de cards)
- ✅ Explicaciones de 1 línea
- ✅ Hover rápido para aclarar términos
- ❌ NO para explicaciones largas (usa modal)

---

### HelpModal - Guía completa en header de página

```tsx
import { HelpModal } from '@/components/help/HelpModal';
import { helpContent } from '@/lib/help-content';

// En header de página
<div className="flex items-center gap-4">
  <h1>Análisis de Sueño</h1>
  <HelpModal title="Guía de Sueño" triggerText="">
    {helpContent.sleepScore.long}
  </HelpModal>
</div>

// Con trigger text personalizado
<HelpModal 
  title="Cómo funciona el Dashboard" 
  triggerText="Ver guía completa"
>
  <p>Contenido markdown o JSX aquí...</p>
</HelpModal>
```

**Cuándo usar:**
- ✅ Headers de páginas (ayuda general)
- ✅ Guías completas con múltiples secciones
- ✅ Explicaciones largas con ejemplos
- ❌ NO junto a cada métrica (usa tooltip)

---

## 📚 Help Content Library

### Entries Disponibles

```tsx
import { helpContent } from '@/lib/help-content';

// Sleep
helpContent.sleepScore.short     // "Calidad general del sueño..."
helpContent.sleepScore.long      // JSX completo con rangos y tips
helpContent.totalSleep.short
helpContent.totalSleep.long
helpContent.deepSleep.short
helpContent.deepSleep.long
helpContent.remSleep.short
helpContent.remSleep.long

// Recovery
helpContent.readinessScore.short
helpContent.readinessScore.long
helpContent.hrv.short
helpContent.hrv.long
helpContent.restingHeartRate.short
helpContent.restingHeartRate.long
helpContent.temperature.short
helpContent.temperature.long
helpContent.respiratoryRate.short
helpContent.respiratoryRate.long

// Activity
helpContent.activityScore.short
helpContent.activityScore.long
helpContent.steps.short
helpContent.steps.long

// Navigation
helpContent.navigation.long      // Ayuda general del dashboard
```

---

## ➕ Agregar Nueva Help Entry

Edita `lib/help-content.tsx`:

```tsx
export const helpContent = {
  // ... existing entries
  
  miNuevaMetrica: {
    short: "Explicación breve de 1 línea.",
    long: (
      <>
        <h2>Título de la Métrica</h2>
        <p>Descripción de qué mide y por qué importa.</p>
        
        <h3>Rangos:</h3>
        <ul>
          <li>Excelente: 90-100</li>
          <li>Bueno: 70-89</li>
          <li>Regular: 50-69</li>
          <li>&lt;50: Necesita atención</li>
        </ul>
        
        <h3>Tips para mejorar:</h3>
        <ul>
          <li>Tip accionable 1</li>
          <li>Tip accionable 2</li>
          <li>Tip accionable 3</li>
        </ul>
      </>
    )
  }
};
```

### Guía de Estilo para Contenido

✅ **DO:**
- Español simple y claro
- Evita jerga técnica
- Da rangos numéricos específicos
- Incluye tips accionables
- Usa emojis para categorizar
- Habla en segunda persona ("tu", "tus")

❌ **DON'T:**
- Usar siglas sin explicar (HRV → Variabilidad del Ritmo Cardíaco)
- Descripciones vagas ("bueno", "malo" sin contexto)
- Teoría sin aplicación práctica
- Lenguaje médico complejo
- Hablar en tercera persona ("el usuario")

---

## 🎨 Ejemplos Completos

### Ejemplo 1: Métrica con Tooltip

```tsx
import { Card } from '@/components/ui/card';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { helpContent } from '@/lib/help-content';

function MetricCard() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold">Variabilidad Cardíaca</h3>
        <HelpTooltip content={helpContent.hrv.short} />
      </div>
      <p className="text-4xl font-bold">52 ms</p>
      <p className="text-sm text-gray-600">Promedio últimos 7 días</p>
    </Card>
  );
}
```

**Resultado:**
- Usuario ve "Variabilidad Cardíaca" con icono `?`
- Hover → "Más alto = mejor recuperación"
- Click → (nada, solo tooltip)

---

### Ejemplo 2: Página con Modal

```tsx
import { HelpModal } from '@/components/help/HelpModal';
import { helpContent } from '@/lib/help-content';

function SleepPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Análisis de Sueño</h1>
        <HelpModal title="Guía de Sueño" triggerText="">
          {helpContent.sleepScore.long}
        </HelpModal>
      </div>
      
      {/* Resto de la página */}
      <div className="grid gap-6">
        {/* Métricas con tooltips */}
      </div>
    </div>
  );
}
```

**Resultado:**
- Header con botón `? Más información`
- Click → Modal con guía completa
- Usuario puede leer, scrollear, cerrar

---

### Ejemplo 3: Combinar Tooltip + Modal

```tsx
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { HelpModal } from '@/components/help/HelpModal';
import { helpContent } from '@/lib/help-content';

function CompletePage() {
  return (
    <div>
      {/* Header con modal global */}
      <div className="flex justify-between items-center mb-6">
        <h1>Mi Página</h1>
        <HelpModal title="Ayuda Completa">
          {helpContent.navigation.long}
        </HelpModal>
      </div>
      
      {/* Métricas con tooltips individuales */}
      <div className="grid gap-4">
        <Card>
          <div className="flex items-center gap-2">
            <h3>Métrica 1</h3>
            <HelpTooltip content={helpContent.sleepScore.short} />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-2">
            <h3>Métrica 2</h3>
            <HelpTooltip content={helpContent.hrv.short} />
          </div>
        </Card>
      </div>
    </div>
  );
}
```

**Patrón recomendado:**
- 1 modal global en header (ayuda general)
- N tooltips en métricas individuales (ayuda específica)

---

## 🎯 Best Practices

### Tooltips
1. **Breve:** Máximo 1-2 líneas
2. **Claro:** Sin jerga
3. **Útil:** Responde "¿qué es esto?"
4. **Lado:** `top` (default) o `right` si hay espacio

### Modals
1. **Título descriptivo:** "Guía de Sueño" no "Ayuda"
2. **triggerText:** Vacío `""` usa solo icono, o texto personalizado
3. **Contenido:** JSX estructurado con h2, h3, ul, p
4. **Scrolleable:** No preocuparse por largo, modal tiene overflow

### Contenido
1. **Empieza simple:** "Qué mide"
2. **Da contexto:** "Por qué importa"
3. **Rangos numéricos:** "85-100: Excelente"
4. **Tips accionables:** "Evita pantallas 1h antes de dormir"
5. **Personaliza:** "Tu baseline" no "el promedio"

---

## 🔍 Debugging

### Tooltip no aparece
- ✅ Verifica import de `HelpTooltip`
- ✅ Verifica content no esté vacío
- ✅ Prueba cambiar `side` prop

### Modal no abre
- ✅ Verifica import de `HelpModal`
- ✅ Verifica children no esté vacío
- ✅ Check console para errores

### Contenido no se ve bien
- ✅ Usa JSX en `long` entries (no strings)
- ✅ Usa prose classes para styling
- ✅ Verifica estructura HTML válida

---

## 📊 Analytics (Opcional)

Trackear engagement:

```tsx
function HelpTooltip({ content, side, onOpen }: Props) {
  const handleOpen = () => {
    // Track analytics
    analytics.track('help_tooltip_opened', {
      content: content.substring(0, 50),
      side
    });
    onOpen?.();
  };
  
  // ... resto del componente
}
```

---

## ✅ Checklist al Agregar Ayuda

Cuando agregues help a una nueva página:

- [ ] Importar `HelpTooltip` y `HelpModal`
- [ ] Importar `helpContent`
- [ ] Agregar modal en header (ayuda general)
- [ ] Agregar tooltips en métricas principales
- [ ] Verificar contenido es claro y sin jerga
- [ ] Probar hover y click funcionan
- [ ] Verificar keyboard navigation (Tab)
- [ ] Verificar touch targets (44x44px)

---

**Guía creada:** 2026-03-25  
**Última actualización:** 2026-03-25
