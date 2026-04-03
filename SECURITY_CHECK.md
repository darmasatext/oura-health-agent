# 🔒 Security Check - Pre-Push Audit

## ❌ ARCHIVOS A NO SUBIR (NUNCA)

### **Secretos y Credenciales:**
```
gcp-service-account.json
gcp-key-oneline.txt
.env
.env.local
.env.production
.env.development
```

### **Información Personal Identificable (PII):**
```
Ningún dato real de salud
Ningún nombre real
Ningún email real
Ningún teléfono
```

### **Configuración Sensible:**
```
SSH keys
API tokens
Database passwords
Service account keys
```

### **Datos de Producción:**
```
Logs con queries reales
Datos biométricos reales
Información del usuario
```

---

## ✅ ARCHIVOS SEGUROS PARA SUBIR

### **Código:**
```
app/**/*.tsx
app/**/*.ts
components/**/*.tsx
lib/**/*.ts
public/**/*
```

### **Configuración Pública:**
```
package.json (sin secretos)
tsconfig.json
next.config.js (sin keys)
tailwind.config.ts
```

### **Documentación:**
```
README.md
CHANGELOG.md
docs/**/*.md
```

### **Screenshots (SIN DATOS REALES):**
```
screenshots/dashboard-home.png
screenshots/dashboard-sleep.png
screenshots/dashboard-activity.png
screenshots/dashboard-recovery.png
screenshots/dashboard-insights.png
screenshots/dashboard-compare.png
```

---

## 🔍 AUDIT CHECKLIST

- [ ] No hay archivos `.json` con keys
- [ ] No hay archivos `.env*`
- [ ] No hay datos reales en commits
- [ ] No hay PII en código
- [ ] Screenshots son genéricos (sin datos reales)
- [ ] README no expone infraestructura
- [ ] No hay URLs de producción
- [ ] .gitignore está actualizado

---

## 📋 .gitignore REQUERIDO

```gitignore
# Secrets
*.json
!package.json
!package-lock.json
!tsconfig.json
.env*
gcp-*

# Build
.next/
out/
build/
dist/

# Dependencies
node_modules/

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Local data
data/
*.csv
*.sql

# Temporary
*.tmp
*.temp
.vercelignore

# Documentation (opcional - algunos tienen info sensible)
AUDIT_*.md
BUG_*.md
COST_*.md
DATA_VALIDATION_*.md
DEPLOYMENT_*.md
INTEGRATION_*.md
NIGHT_*.md
QA_*.md
SUBAGENT_*.md
TEST_*.md
VALIDATION_*.md
VERCEL_*.md
build*.log
build*.txt
typescript*.log
*_status.txt
gcp-*.txt
```

---

## 🎯 RECOMENDACIÓN

**ANTES de hacer push:**

1. Revisar cada archivo modificado
2. Asegurar que NO hay keys/secrets
3. Verificar .gitignore
4. Hacer screenshots GENÉRICOS (mockdata)
5. Sanitizar README de URLs/IPs

**DESPUÉS de push:**

1. Verificar en GitHub que no se filtró nada
2. Si se filtró algo, borrar repo inmediatamente
3. Rotar todas las keys comprometidas
