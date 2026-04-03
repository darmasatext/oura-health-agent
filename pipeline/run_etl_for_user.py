#!/usr/bin/env python3
"""
Wrapper para ejecutar ETL para un usuario específico
Uso: python3 run_etl_for_user.py <user_slug>
"""
import sys
import os

if len(sys.argv) < 2:
    print("Uso: python3 run_etl_for_user.py <user_slug>")
    print("Ejemplo: python3 run_etl_for_user.py fer")
    sys.exit(1)

user_slug = sys.argv[1]

# Configurar variables de entorno
os.environ['TABLE_ID'] = f'daily_biometrics_{user_slug}'

# Cargar configuración de usuarios
import json
from pathlib import Path

config_path = Path(__file__).parent / "config" / "user_tokens.json"
with open(config_path, 'r') as f:
    config = json.load(f)

# Encontrar usuario
user = None
for u in config['users']:
    if u['slug'] == user_slug:
        user = u
        break

if not user:
    print(f"❌ Usuario '{user_slug}' no encontrado en config")
    sys.exit(1)

if not user.get('active', False):
    print(f"❌ Usuario '{user_slug}' no está activo")
    sys.exit(1)

# Configurar token
os.environ['OURA_TOKEN'] = user['token']

print(f"🚀 Ejecutando ETL para: {user['name']} ({user_slug})")
print(f"📊 Tabla destino: daily_biometrics_{user_slug}")
print()

# Importar y ejecutar el ETL v2
sys.path.insert(0, str(Path(__file__).parent / "src"))
import main_v2_merge

# El módulo se ejecuta automáticamente al importar
