#!/usr/bin/env python3
"""
ETL Multi-Usuario - Wrapper Simple
Ejecuta main_v2_merge.py para cada usuario activo
"""
import os
import sys
import json
import subprocess
from pathlib import Path

# Ruta al script ETL v2
ETL_SCRIPT = Path(__file__).parent / "src" / "main_v2_merge.py"
CONFIG_FILE = Path(__file__).parent / "config" / "user_tokens.json"

def load_users():
    """Carga configuración de usuarios desde user_tokens.json"""
    if not CONFIG_FILE.exists():
        print(f"❌ Error: No se encuentra {CONFIG_FILE}")
        print(f"   Crea el archivo con: {{'users': [{{'slug': 'fer', 'name': 'Fer', 'token': '...', 'enabled': true}}]}}")
        sys.exit(1)
    
    with open(CONFIG_FILE) as f:
        config = json.load(f)
    
    users = config.get('users', [])
    active_users = [u for u in users if u.get('active', False)]
    
    if not active_users:
        print("⚠️  No hay usuarios activos en user_tokens.json")
        sys.exit(0)
    
    return active_users

def run_etl_for_user(user):
    """Ejecuta ETL v2 para un usuario específico"""
    slug = user['slug']
    name = user['name']
    token = user['token']
    
    # Tabla destino por usuario
    table_id = f"daily_biometrics_{slug}"
    
    print(f"\n{'='*60}")
    print(f"🔄 Ejecutando ETL para: {name} ({slug})")
    print(f"   Tabla: {table_id}")
    print(f"{'='*60}\n")
    
    # Preparar variables de entorno
    env = os.environ.copy()
    env['OURA_TOKEN'] = token
    env['TABLE_ID'] = table_id  # Override de tabla
    env['USER_NAME'] = name     # Para mensajes Telegram
    
    # Ejecutar ETL v2
    try:
        result = subprocess.run(
            ['python3', str(ETL_SCRIPT)],
            env=env,
            capture_output=True,
            text=True,
            timeout=300  # 5 minutos max
        )
        
        # Mostrar output
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr, file=sys.stderr)
        
        if result.returncode == 0:
            print(f"✅ ETL completado para {name}")
            return True
        else:
            print(f"❌ ETL falló para {name} (exit code: {result.returncode})")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"⏱️  ETL timeout para {name}")
        return False
    except Exception as e:
        print(f"❌ Error ejecutando ETL para {name}: {e}")
        return False

def main():
    """Ejecuta ETL para todos los usuarios activos"""
    print("\n🚀 ETL Multi-Usuario - Inicio\n")
    
    users = load_users()
    print(f"👥 Usuarios activos: {len(users)}")
    for u in users:
        print(f"   - {u['name']} ({u['slug']})")
    print()
    
    # Ejecutar ETL por cada usuario
    results = {}
    for user in users:
        success = run_etl_for_user(user)
        results[user['slug']] = success
    
    # Resumen final
    print(f"\n{'='*60}")
    print("📊 RESUMEN FINAL")
    print(f"{'='*60}")
    
    success_count = sum(1 for v in results.values() if v)
    fail_count = len(results) - success_count
    
    for slug, success in results.items():
        status = "✅ OK" if success else "❌ FALLÓ"
        print(f"  {status}  {slug}")
    
    print(f"\n  Total: {success_count} exitosos, {fail_count} fallidos")
    print(f"{'='*60}\n")
    
    # Exit code: 0 si todos exitosos, 1 si alguno falló
    sys.exit(0 if fail_count == 0 else 1)

if __name__ == "__main__":
    main()
