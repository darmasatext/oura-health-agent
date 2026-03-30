#!/bin/bash

echo "🍎 Oura Health Dashboard - Instalador para Mac M1"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en Mac
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ Error: Este script es para macOS${NC}"
    exit 1
fi

# Verificar arquitectura ARM64
ARCH=$(uname -m)
if [[ "$ARCH" != "arm64" ]]; then
    echo -e "${YELLOW}⚠️  Advertencia: Detectado $ARCH, se recomienda ARM64 (M1/M2/M3)${NC}"
fi

echo -e "${GREEN}✅ Sistema: macOS $(sw_vers -productVersion) ($ARCH)${NC}"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo ""
    echo "Instala Node.js desde:"
    echo "  https://nodejs.org/en/download"
    echo ""
    echo "O con Homebrew:"
    echo "  brew install node@20"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm: v$NPM_VERSION${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde el directorio dashboard/${NC}"
    echo "   cd oura-dashboard/dashboard"
    exit 1
fi

echo "📦 Paso 1/4: Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencias instaladas${NC}"
echo ""

echo "🔧 Paso 2/4: Configurando variables de entorno..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Creado .env.local desde .env.example${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANTE: Debes editar .env.local y agregar el Service Account${NC}"
        echo ""
        echo "   Edita con:"
        echo "   nano .env.local"
        echo "   o"
        echo "   open -a TextEdit .env.local"
        echo ""
    else
        echo -e "${RED}❌ No se encontró .env.example${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  .env.local ya existe, no se sobrescribe${NC}"
fi
echo ""

echo "🔍 Paso 3/4: Verificando configuración..."
if grep -q "GOOGLE_APPLICATION_CREDENTIALS_JSON=$" .env.local && \
   grep -q "^# GOOGLE_APPLICATION_CREDENTIALS=" .env.local; then
    echo -e "${YELLOW}⚠️  Service Account no configurado en .env.local${NC}"
    echo ""
    echo "   Debes configurar UNA de estas opciones en .env.local:"
    echo ""
    echo "   Opción A (archivo local - recomendado):"
    echo "   1. Guarda service_account.json en ~/.secrets/"
    echo "   2. En .env.local, descomenta y ajusta:"
    echo "      GOOGLE_APPLICATION_CREDENTIALS=/Users/$(whoami)/.secrets/service_account.json"
    echo ""
    echo "   Opción B (JSON en línea - para Vercel):"
    echo "   1. En .env.local, pega el JSON completo en:"
    echo "      GOOGLE_APPLICATION_CREDENTIALS_JSON={\"type\":\"service_account\",...}"
    echo ""
    ENV_READY=false
else
    echo -e "${GREEN}✅ Variables de entorno configuradas${NC}"
    ENV_READY=true
fi
echo ""

echo "🎨 Paso 4/4: Verificando build..."
echo "   Esto puede tomar 30-40 segundos..."
npm run build > /tmp/build-check.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
else
    echo -e "${YELLOW}⚠️  Build con warnings (posiblemente por Service Account)${NC}"
    echo "   Ver detalles en: /tmp/build-check.log"
fi
echo ""

echo "=================================================="
echo -e "${GREEN}🎉 ¡Instalación completada!${NC}"
echo "=================================================="
echo ""

if [ "$ENV_READY" = false ]; then
    echo -e "${YELLOW}⚠️  SIGUIENTE PASO: Configurar Service Account${NC}"
    echo ""
    echo "1. Edita .env.local:"
    echo "   open -a TextEdit .env.local"
    echo ""
    echo "2. Configura el Service Account (ver opciones arriba)"
    echo ""
    echo "3. Luego ejecuta:"
    echo "   npm run dev"
    echo ""
else
    echo "Para iniciar el dashboard:"
    echo ""
    echo "   npm run dev"
    echo ""
    echo "Luego abre en tu navegador:"
    echo "   http://localhost:3000"
    echo ""
    echo "O ejecuta:"
    echo "   open http://localhost:3000"
    echo ""
fi

echo "📚 Documentación completa: INSTALL_MAC_M1.md"
echo ""
echo "🆘 Si tienes problemas:"
echo "   - Lee INSTALL_MAC_M1.md"
echo "   - Revisa /tmp/build-check.log"
echo "   - Ejecuta: npm run dev (los errores se muestran en consola)"
echo ""
