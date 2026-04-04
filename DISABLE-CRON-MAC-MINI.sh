#!/bin/bash
# Script para deshabilitar el cron del ETL en Mac Mini
# Ejecutar en: Mac Mini (192.168.0.83)
# Fecha: 2026-04-03

set -e

echo "🛑 Deshabilitando cron del ETL en Mac Mini..."
echo ""

# 1. Verificar cron actual
echo "📋 Cron actual:"
crontab -l 2>/dev/null | grep -i oura || echo "  No hay cron de Oura configurado"
echo ""

# 2. Backup del crontab actual
echo "💾 Creando backup del crontab..."
BACKUP_FILE="$HOME/crontab-backup-$(date +%Y%m%d-%H%M%S).txt"
crontab -l > "$BACKUP_FILE" 2>/dev/null || echo "  No hay crontab para respaldar"
echo "  ✅ Backup guardado en: $BACKUP_FILE"
echo ""

# 3. Eliminar línea del cron de Oura
echo "🗑️  Eliminando cron del ETL..."
crontab -l 2>/dev/null | grep -v "oura-etl-daily.sh" | crontab - 2>/dev/null || true
echo "  ✅ Cron eliminado"
echo ""

# 4. Verificar que se eliminó
echo "✅ Cron actual (sin Oura):"
crontab -l 2>/dev/null || echo "  Crontab vacío (correcto)"
echo ""

# 5. Opcional: Deshabilitar script (renombrar para que no se ejecute)
echo "🔒 Deshabilitando script de ETL..."
if [ -f "$HOME/oura-dashboard-scripts/oura-etl-daily.sh" ]; then
    mv "$HOME/oura-dashboard-scripts/oura-etl-daily.sh" \
       "$HOME/oura-dashboard-scripts/oura-etl-daily.sh.disabled"
    echo "  ✅ Script renombrado a .disabled"
else
    echo "  ⚠️  Script no encontrado (ya deshabilitado o ruta diferente)"
fi
echo ""

echo "🎉 COMPLETADO - Cron deshabilitado exitosamente"
echo ""
echo "📝 Resumen:"
echo "  ✅ Backup del cron guardado en: $BACKUP_FILE"
echo "  ✅ Cron de Oura ETL eliminado"
echo "  ✅ Script renombrado a .disabled"
echo ""
echo "💡 El ETL ahora corre SOLO en GCP Cloud Run Job:"
echo "   Job: oura-etl-v2-merge"
echo "   Horario: 7 AM y 7 PM (America/Mexico_City)"
echo "   Región: us-central1"
echo ""
echo "🔄 Para restaurar el cron (si es necesario):"
echo "   crontab $BACKUP_FILE"
