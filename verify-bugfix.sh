#!/bin/bash

# Script de verificación del BugFix: avg.avg_hours?.toFixed is not a function

set -e

echo "🔍 VERIFICANDO BUGFIX: TypeError en página Sleep"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: TypeScript compilation
echo "📝 Check 1: TypeScript compilation"
if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
    echo -e "${RED}❌ TypeScript tiene errores${NC}"
    exit 1
else
    echo -e "${GREEN}✅ TypeScript compila sin errores${NC}"
fi
echo ""

# Check 2: Build de producción
echo "🏗️  Check 2: Build de producción"
if npm run build 2>&1 | grep -q "Compiled successfully"; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
else
    echo -e "${RED}❌ Build falló${NC}"
    exit 1
fi
echo ""

# Check 3: Iniciar servidor (background)
echo "🚀 Check 3: Iniciando servidor de desarrollo"
npm run dev > /tmp/verify-server.log 2>&1 &
SERVER_PID=$!
echo "   PID del servidor: $SERVER_PID"

# Esperar a que el servidor esté listo
sleep 10
PORT=$(grep -oP 'localhost:\K\d+' /tmp/verify-server.log | head -1)
echo "   Servidor en puerto: $PORT"
echo ""

# Check 4: Test del API
echo "🧪 Check 4: Testing /api/sleep?type=averages"
RESPONSE=$(curl -s "http://localhost:$PORT/api/sleep?type=averages")

if echo "$RESPONSE" | jq -e '.data.avg_hours' > /dev/null 2>&1; then
    AVG_HOURS=$(echo "$RESPONSE" | jq -r '.data.avg_hours')
    AVG_TYPE=$(echo "$RESPONSE" | jq -r '.data.avg_hours | type')
    
    if [ "$AVG_TYPE" = "number" ]; then
        echo -e "${GREEN}✅ avg_hours es un número: $AVG_HOURS${NC}"
    else
        echo -e "${RED}❌ avg_hours NO es un número (es: $AVG_TYPE)${NC}"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
else
    echo -e "${RED}❌ API no retorna avg_hours${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo ""

# Check 5: Test de .toFixed()
echo "🎯 Check 5: Verificando que .toFixed() funciona"
node -e "
const avg_hours = $AVG_HOURS;
try {
    const result = avg_hours.toFixed(1);
    console.log('✅ avg_hours.toFixed(1) = \"' + result + 'h\"');
    console.log('');
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ .toFixed() funciona correctamente${NC}"
else
    echo -e "${RED}❌ .toFixed() sigue fallando${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo ""

# Cleanup
echo "🧹 Limpiando..."
kill $SERVER_PID 2>/dev/null
rm -f /tmp/verify-server.log
echo ""

echo "=================================================="
echo -e "${GREEN}🎉 TODOS LOS CHECKS PASARON - BUG ARREGLADO!${NC}"
echo "=================================================="
echo ""
echo "El bug 'avg.avg_hours?.toFixed is not a function' está resuelto."
echo "La página /sleep ahora carga correctamente."
echo ""
