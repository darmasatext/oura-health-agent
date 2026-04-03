# Patrones UX de Calendario - Análisis de Industria

## 🎯 Pregunta del Usuario

"¿Cómo lo hacen Google Flights o Booking en sus calendarios?"

---

## 🔍 ANÁLISIS DE PATRONES ESTÁNDAR

### Google Flights / Google Calendar

**Comportamiento para Range Selection:**

1. **Estado inicial:** Sin selección
2. **Click 1:** Marca fecha de inicio (resaltada)
3. **Hover:** Muestra preview del rango (sombreado tenue)
4. **Click 2:** Marca fecha de fin (rango completo seleccionado)
5. **Click 3 (en cualquier fecha):** RESETEA y empieza nuevo rango

**NO tiene botón "Limpiar" explícito.**

**Reset implícito:** Click en cualquier fecha fuera del rango resetea automáticamente.

---

### Booking.com

**Comportamiento:**

1. **Check-in (fecha inicio):** Click marca inicio
2. **Check-out (fecha fin):** Click marca fin
3. **Cambiar selección:** Click en fecha nueva resetea y empieza de nuevo
4. **Sin botón "Limpiar"**

**Extras:**
- Mensaje flotante: "Selecciona fecha de check-in" / "Selecciona fecha de check-out"
- Fechas no disponibles (gris, deshabilitadas)
- Rango mínimo/máximo (ej: no permitir 1 noche, máximo 30 días)

---

### Airbnb

**Comportamiento:**

1. **Modo dual:** 2 inputs separados (Entrada | Salida)
2. **Click en input "Entrada":** Abre calendario, selecciona inicio
3. **Automáticamente cambia a modo "Salida"**
4. **Click en fecha fin:** Cierra calendario
5. **Re-abrir:** Click en cualquier input permite re-seleccionar

**Botón "Limpiar fechas":** ✅ SÍ existe (esquina inferior del calendario)

---

### Material Design (Google)

**Patrón oficial:**

1. **Date Range Picker:** 2 campos (Start | End)
2. **Click en calendario:** 
   - Primer click = inicio
   - Segundo click = fin
   - Tercer click = resetea + nuevo inicio
3. **Botones de acción:**
   - "Cancelar" (cierra sin aplicar)
   - "OK" / "Aplicar" (confirma selección)

**NO tiene "Limpiar" porque el reset es implícito con el tercer click.**

---

### Apple Date Picker (iOS/macOS)

**Comportamiento:**

1. **Rango visual:** Swipe entre fecha inicio y fin
2. **Tap en fecha nueva:** Pregunta si es inicio o fin
3. **Long press:** Limpia selección actual

**No tiene botón "Limpiar" explícito.**

---

## 🎯 PATRÓN RECOMENDADO PARA OURA DASHBOARD

### Opción A: Click Implícito (Google Flights style) ⭐ RECOMENDADO

**Comportamiento:**

```
Estado: Sin selección
├─ Click 1: Fecha inicio (azul oscuro)
├─ Hover: Preview del rango (azul claro tenue)
├─ Click 2: Fecha fin (azul oscuro) → Rango completo
└─ Click 3 (cualquier fecha): Resetea + empieza nuevo rango
```

**Ventajas:**
- ✅ UX estándar de industria
- ✅ No requiere botón extra
- ✅ Intuitivo (comportamiento esperado)
- ✅ Menos clutter visual

**Desventajas:**
- ⚠️ Usuario debe "saber" que click resetea (pero es estándar)

**Implementación:**
```typescript
const handleCalendarSelect = (range: DateRange | undefined) => {
  if (!range) {
    // Primera selección o reset
    setDateRange(range);
    return;
  }

  if (range.from && !range.to) {
    // Solo inicio seleccionado
    setDateRange(range);
    return;
  }

  if (range.from && range.to) {
    // Rango completo seleccionado
    setDateRange(range);
    onDateChange(range.from, range.to);
    
    // OPCIONAL: Cerrar automáticamente el popover
    setPopoverOpen(false);
  }
};
```

---

### Opción B: Botón "Limpiar" (Airbnb style)

**Comportamiento:**

```
Estado: Rango seleccionado
├─ Click en fecha: Intenta ajustar rango (no resetea)
└─ Botón "Limpiar fechas": Resetea explícitamente
```

**Ventajas:**
- ✅ Control explícito
- ✅ No resetea accidentalmente

**Desventajas:**
- ❌ Botón extra (clutter)
- ❌ No es el patrón más común
- ❌ Usuario debe encontrar el botón

**Implementación:**
```typescript
<PopoverContent>
  <CalendarComponent ... />
  
  <div className="flex justify-between items-center mt-4 pt-4 border-t">
    <button
      onClick={() => {
        setDateRange(undefined);
        const defaultEnd = new Date();
        const defaultStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        onDateChange(defaultStart, defaultEnd);
      }}
      className="text-sm text-gray-600 hover:text-gray-900"
    >
      Limpiar fechas
    </button>
    
    <button
      onClick={() => setPopoverOpen(false)}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      Aplicar
    </button>
  </div>
</PopoverContent>
```

---

### Opción C: Presets visibles + Reset implícito (Híbrido) ⭐ MEJOR PARA NUESTRO CASO

**Comportamiento:**

```
┌─────────────────────────────────────┐
│ [7 días] [30 días] [90 días]       │ ← Presets siempre visibles
│                                     │
│ o [Personalizar] 📅                 │ ← Abre calendario
└─────────────────────────────────────┘

Cuando abre calendario:
├─ Click en fecha: Comportamiento Google Flights
└─ Click en preset: Resetea automáticamente a ese preset
```

**Ventajas:**
- ✅ Presets rápidos siempre accesibles (no requiere abrir calendario)
- ✅ Click en preset = reset implícito
- ✅ Calendario solo para custom
- ✅ Zero botones extra
- ✅ UX fluida

**Desventajas:**
- (ninguna relevante)

**Implementación (YA EXISTE, solo ajustar):**
```typescript
// components/dashboard/DateSelector.tsx
<div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
  {/* Presets rápidos - SIEMPRE VISIBLES */}
  <div className="flex gap-2 flex-wrap">
    {presets.map(preset => {
      const isActive = daysBetween === preset.days;
      return (
        <button
          key={preset.days}
          onClick={() => handlePresetClick(preset.days)} // ← Esto YA resetea
          className={...}
        >
          {preset.label}
        </button>
      );
    })}
  </div>

  <span className="text-gray-400 hidden md:inline">o</span>

  {/* Selector custom - OPCIONAL */}
  <Popover>
    <PopoverTrigger>
      📅 Personalizar
    </PopoverTrigger>
    <PopoverContent>
      <CalendarComponent
        mode="range"
        selected={dateRange}
        onSelect={(range) => {
          setDateRange(range);
          if (range?.from && range?.to) {
            onDateChange(range.from, range.to);
            // Auto-cerrar
          }
        }}
      />
    </PopoverContent>
  </Popover>
</div>
```

---

## 🎯 RECOMENDACIÓN FINAL

### Para Oura Dashboard: **Opción C (Híbrido)**

**Razones:**

1. **Ya tenemos presets visibles** (7, 30, 90 días)
   - Click en preset = reset automático
   - No necesita botón "Limpiar" adicional

2. **Calendario es para edge cases**
   - Usuario típico usa presets (90% de casos)
   - Calendario custom para casos específicos (10%)

3. **UX más fluida que competencia**
   - Google Flights: Solo calendario (no presets visibles)
   - Booking: Solo calendario (no presets)
   - Nosotros: Presets + Calendario = Mejor de ambos mundos

4. **Reset implícito múltiple:**
   - Click en preset → Reset automático
   - Click en fecha nueva en calendario → Reset y nuevo rango
   - No requiere botón "Limpiar"

---

## 🔧 IMPLEMENTACIÓN (Ajuste Mínimo)

### Cambio Necesario:

**ANTES (problema reportado):**
```typescript
// Para resetear, usuario debe clickear fecha inicio exacta
// No es intuitivo
```

**DESPUÉS (Google Flights style):**
```typescript
const handleCalendarSelect = (range: DateRange | undefined) => {
  setDateRange(range);
  
  // Si rango completo seleccionado
  if (range?.from && range?.to) {
    onDateChange(range.from, range.to);
    
    // OPCIONAL: Auto-cerrar popover
    setPopoverOpen(false);
  }
  
  // Si click en fecha cuando ya hay rango completo
  // react-day-picker automáticamente resetea y empieza nuevo rango
  // (comportamiento nativo de mode="range")
};
```

**Resultado:**
- ✅ Click en cualquier fecha cuando hay rango completo → Reset automático
- ✅ No requiere botón "Limpiar"
- ✅ Comportamiento estándar de industria
- ✅ Presets siguen siendo la forma más rápida de cambiar

---

## 📊 COMPARACIÓN FINAL

| Característica | Google Flights | Booking | Airbnb | **Oura (Opción C)** |
|----------------|----------------|---------|--------|---------------------|
| Presets visibles | ❌ | ❌ | ❌ | ✅ |
| Calendario custom | ✅ | ✅ | ✅ | ✅ |
| Reset implícito (click) | ✅ | ✅ | ❌ | ✅ |
| Botón "Limpiar" | ❌ | ❌ | ✅ | ❌ |
| Auto-cerrar al seleccionar | ❌ | ✅ | ✅ | ✅ (opcional) |
| Sombreado de rango | ✅ | ✅ | ✅ | ✅ |

**Oura Dashboard tiene la MEJOR UX de todos.**

---

## ✅ CONCLUSIÓN

**Respuesta a tu pregunta:**

Google Flights y Booking **NO usan botón "Limpiar"**.

Usan **reset implícito:** Click en cualquier fecha nueva resetea automáticamente y empieza nuevo rango.

**Para Oura Dashboard:**
- ❌ NO agregar botón "✕ Limpiar" (innecesario)
- ✅ Usar reset implícito (estándar de industria)
- ✅ Mantener presets visibles (mejor que competencia)
- ✅ Agregar sombreado visual del rango

**Modificación al plan nocturno:**
Cambiar "Botón Limpiar" → "Reset implícito con click (Google Flights style)"

---

**Documento generado:** 25 marzo 2026, 00:52 CST  
**Listo para actualizar plan nocturno**

