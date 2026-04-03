#!/bin/bash

# Script de verificación de Mobile Responsive Optimization

echo "🔍 Verificando implementación mobile responsive..."
echo ""

# Verificar archivos modificados
echo "✅ Archivos modificados:"
echo "   - components/layout/Navigation.tsx (Hamburger menu)"
echo "   - app/globals.css (Media queries)"
echo "   - components/dashboard/MetricCard.tsx (Responsive layout)"
echo "   - components/dashboard/DateSelector.tsx (Stack mobile)"
echo "   - components/charts/SleepDurationChart.tsx (Mobile charts)"
echo "   - components/charts/ComparisonRadarChart.tsx (Mobile charts)"
echo "   - components/charts/ReadinessChart.tsx (Mobile charts)"
echo "   - components/charts/HRVChart.tsx (Mobile charts)"
echo "   - app/layout.tsx (Viewport metadata)"
echo ""

# Verificar Navigation
echo "🔍 Verificando Navigation.tsx..."
if grep -q "Menu, X" components/layout/Navigation.tsx && \
   grep -q "mobileMenuOpen" components/layout/Navigation.tsx && \
   grep -q "md:hidden" components/layout/Navigation.tsx; then
    echo "   ✅ Hamburger menu implementado"
else
    echo "   ❌ Error en Navigation"
    exit 1
fi

# Verificar globals.css
echo "🔍 Verificando globals.css..."
if grep -q "MOBILE RESPONSIVE OPTIMIZATION" app/globals.css && \
   grep -q "max-width: 767px" app/globals.css && \
   grep -q "min-height: 44px" app/globals.css; then
    echo "   ✅ Media queries implementadas"
else
    echo "   ❌ Error en globals.css"
    exit 1
fi

# Verificar MetricCard
echo "🔍 Verificando MetricCard.tsx..."
if grep -q "p-4 md:p-6" components/dashboard/MetricCard.tsx && \
   grep -q "text-3xl md:text-4xl" components/dashboard/MetricCard.tsx; then
    echo "   ✅ MetricCard responsive"
else
    echo "   ❌ Error en MetricCard"
    exit 1
fi

# Verificar DateSelector
echo "🔍 Verificando DateSelector.tsx..."
if grep -q "flex-col md:flex-row" components/dashboard/DateSelector.tsx && \
   grep -q "w-full md:w-auto" components/dashboard/DateSelector.tsx; then
    echo "   ✅ DateSelector responsive"
else
    echo "   ❌ Error en DateSelector"
    exit 1
fi

# Verificar charts
echo "🔍 Verificando charts..."
if grep -q "useState" components/charts/SleepDurationChart.tsx && \
   grep -q "isMobile" components/charts/SleepDurationChart.tsx && \
   grep -q "window.innerWidth < 768" components/charts/SleepDurationChart.tsx; then
    echo "   ✅ SleepDurationChart responsive"
else
    echo "   ❌ Error en SleepDurationChart"
    exit 1
fi

if grep -q "isMobile ? 250 : 500" components/charts/ComparisonRadarChart.tsx; then
    echo "   ✅ ComparisonRadarChart responsive"
else
    echo "   ❌ Error en ComparisonRadarChart"
    exit 1
fi

# Verificar viewport metadata
echo "🔍 Verificando layout.tsx..."
if grep -q "maximumScale: 5" app/layout.tsx && \
   grep -q "viewport:" app/layout.tsx; then
    echo "   ✅ Viewport metadata configurado"
else
    echo "   ❌ Error en viewport metadata"
    exit 1
fi

echo ""
echo "✅ TODAS LAS VERIFICACIONES PASARON"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Iniciar servidor: npm run dev"
echo "   2. Abrir Chrome DevTools (Cmd/Ctrl + Shift + M)"
echo "   3. Seleccionar dispositivos: iPhone SE (375px), iPad (768px)"
echo "   4. Verificar checklist en MOBILE_RESPONSIVE_TEST.md"
echo ""
echo "📄 Documentación: MOBILE_RESPONSIVE_TEST.md"
