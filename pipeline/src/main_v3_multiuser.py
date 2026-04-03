"""
Oura ETL v3 - Multi-Usuario
Soporta múltiples usuarios con tablas separadas (user-partitioned architecture)
Autor: OpenClaw + Simón
Fecha: 2026-04-03
"""
import os
import requests
import time
import json
from datetime import datetime, date, timedelta
from google.cloud import bigquery
from pathlib import Path

# --- CONFIGURACIÓN ---
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
PROJECT_ID = os.getenv('GOOGLE_CLOUD_PROJECT', 'last-240000')
DATASET_ID = "oura_biometrics"
LOOKBACK_DAYS = int(os.getenv('LOOKBACK_DAYS', '7'))

# Cargar configuración de usuarios
CONFIG_PATH = Path(__file__).parent.parent / "config" / "user_tokens.json"

def load_user_config():
    """Carga configuración de usuarios desde JSON"""
    try:
        with open(CONFIG_PATH, 'r') as f:
            config = json.load(f)
            # Filtrar solo usuarios activos
            return [u for u in config['users'] if u.get('active', False)]
    except FileNotFoundError:
        print(f"⚠️ No se encontró {CONFIG_PATH}")
        return []
    except Exception as e:
        print(f"⚠️ Error cargando config: {e}")
        return []

def send_telegram(msg):
    """Envía notificación a Telegram"""
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "Markdown"}, timeout=10)
    except Exception as e:
        print(f"Error enviando Telegram: {e}")

def get_api_data(endpoint, token, start_date, end_date):
    """Obtiene datos de Oura API con paginación"""
    url = f"https://api.ouraring.com/v2/usercollection/{endpoint}"
    params = {"start_date": start_date, "end_date": end_date}
    headers = {"Authorization": f"Bearer {token}"}
    
    all_items = []
    next_token = None
    
    while True:
        curr_params = params.copy()
        if next_token:
            curr_params['next_token'] = next_token
        
        try:
            resp = requests.get(url, params=curr_params, headers=headers, timeout=30)
            if resp.status_code == 429:
                print("  Rate limit, esperando 2s...")
                time.sleep(2)
                continue
            if resp.status_code != 200:
                print(f"  Error {resp.status_code} en {endpoint}: {resp.text}")
                break
            
            data = resp.json()
            all_items.extend(data.get('data', []))
            next_token = data.get('next_token')
            if not next_token:
                break
        except Exception as e:
            print(f"  Excepción en API: {e}")
            break
    
    return all_items

def parse_time(iso_str):
    """Convierte timestamp ISO a TIME (HH:MM:SS)"""
    if not iso_str:
        return None
    try:
        dt = datetime.fromisoformat(iso_str.replace('Z', '+00:00'))
        return dt.strftime('%H:%M:%S')
    except:
        return None

def ensure_table_exists(bq_client, table_slug):
    """Verifica que la tabla del usuario exista. Si no existe, intenta crearla."""
    table_ref = f"{PROJECT_ID}.{DATASET_ID}.daily_biometrics_{table_slug}"
    
    # Intentar hacer query a la tabla para verificar existencia
    # (más barato que get_table y no requiere bigquery.tables.get)
    try:
        query = f"SELECT COUNT(*) as cnt FROM `{table_ref}` LIMIT 1"
        result = bq_client.query(query).result()
        print(f"  ✅ Tabla daily_biometrics_{table_slug} ya existe")
        return True
    except Exception as e:
        # Tabla no existe o no hay permisos de lectura
        if "not found" in str(e).lower():
            print(f"  ⚠️ Tabla daily_biometrics_{table_slug} no existe")
            print(f"  ℹ️  Crear manualmente o ejecutar desde cuenta con permisos")
            return False
        else:
            # Otro error (permisos, etc.) - asumimos que existe
            print(f"  ℹ️  Asumiendo que tabla daily_biometrics_{table_slug} existe")
            return True

def merge_to_bigquery(bq_client, user_slug, rows):
    """
    Usa MERGE para insertar/actualizar datos sin duplicados
    Tabla específica del usuario: daily_biometrics_{user_slug}
    """
    if not rows:
        print("  No hay datos para cargar")
        return 0
    
    table_id = f"daily_biometrics_{user_slug}"
    table_ref = f"{PROJECT_ID}.{DATASET_ID}.{table_id}"
    temp_table = f"{PROJECT_ID}.{DATASET_ID}.temp_{user_slug}_{int(time.time())}"
    
    try:
        # 1. Verificar que la tabla exista
        if not ensure_table_exists(bq_client, user_slug):
            return 0
        
        # 2. Crear tabla temporal con schema explícito
        print(f"  Creando tabla temporal: {temp_table}")
        
        schema = [
            bigquery.SchemaField("calendar_date", "DATE"),
            bigquery.SchemaField("sleep_score", "INT64"),
            bigquery.SchemaField("total_sleep_seconds", "INT64"),
            bigquery.SchemaField("deep_sleep_seconds", "INT64"),
            bigquery.SchemaField("rem_sleep_seconds", "INT64"),
            bigquery.SchemaField("light_sleep_seconds", "INT64"),
            bigquery.SchemaField("awake_time_seconds", "INT64"),
            bigquery.SchemaField("sleep_efficiency_pct", "INT64"),
            bigquery.SchemaField("restless_periods", "INT64"),
            bigquery.SchemaField("sleep_latency_seconds", "INT64"),
            bigquery.SchemaField("sleep_timing_score", "INT64"),
            bigquery.SchemaField("bedtime_start", "TIME"),
            bigquery.SchemaField("bedtime_end", "TIME"),
            bigquery.SchemaField("readiness_score", "INT64"),
            bigquery.SchemaField("temperature_deviation_celsius", "FLOAT64"),
            bigquery.SchemaField("activity_balance", "INT64"),
            bigquery.SchemaField("body_temperature_contributor", "INT64"),
            bigquery.SchemaField("hrv_balance", "INT64"),
            bigquery.SchemaField("previous_day_activity", "INT64"),
            bigquery.SchemaField("previous_night", "INT64"),
            bigquery.SchemaField("recovery_index", "INT64"),
            bigquery.SchemaField("resting_heart_rate_contributor", "INT64"),
            bigquery.SchemaField("sleep_balance", "INT64"),
            bigquery.SchemaField("sleep_regularity", "INT64"),
            bigquery.SchemaField("temperature_score", "FLOAT64"),
            bigquery.SchemaField("activity_score", "INT64"),
            bigquery.SchemaField("steps", "INT64"),
            bigquery.SchemaField("active_calories", "INT64"),
            bigquery.SchemaField("total_calories", "INT64"),
            bigquery.SchemaField("target_calories", "INT64"),
            bigquery.SchemaField("target_distance_meters", "INT64"),
            bigquery.SchemaField("inactivity_alerts", "INT64"),
            bigquery.SchemaField("high_activity_hours", "FLOAT64"),
            bigquery.SchemaField("medium_activity_hours", "FLOAT64"),
            bigquery.SchemaField("low_activity_hours", "FLOAT64"),
            bigquery.SchemaField("resting_hours", "FLOAT64"),
            bigquery.SchemaField("non_wear_hours", "FLOAT64"),
            bigquery.SchemaField("average_met_minutes", "FLOAT64"),
            bigquery.SchemaField("high_activity_met_minutes", "INT64"),
            bigquery.SchemaField("medium_activity_met_minutes", "INT64"),
            bigquery.SchemaField("low_activity_met_minutes", "INT64"),
            bigquery.SchemaField("sedentary_met_minutes", "INT64"),
            bigquery.SchemaField("average_hrv_ms", "FLOAT64"),
            bigquery.SchemaField("resting_heart_rate_bpm", "INT64"),
            bigquery.SchemaField("lowest_heart_rate_bpm", "INT64"),
            bigquery.SchemaField("day_summary", "STRING"),
            bigquery.SchemaField("resilience_level", "STRING"),
            bigquery.SchemaField("stress_high_duration_seconds", "INT64"),
            bigquery.SchemaField("recovery_time_seconds", "INT64"),
            bigquery.SchemaField("daytime_recovery_time_seconds", "INT64"),
        ]
        
        job_config = bigquery.LoadJobConfig(
            write_disposition="WRITE_TRUNCATE",
            source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
            schema=schema
        )
        
        load_job = bq_client.load_table_from_json(rows, temp_table, job_config=job_config)
        load_job.result()
        print(f"  ✅ Tabla temporal creada con {len(rows)} registros")
        
        # 3. MERGE desde tabla temporal a tabla principal
        merge_query = f"""
        MERGE `{table_ref}` T
        USING `{temp_table}` S
        ON T.calendar_date = S.calendar_date
        WHEN MATCHED THEN
          UPDATE SET
            sleep_score = S.sleep_score,
            total_sleep_seconds = S.total_sleep_seconds,
            deep_sleep_seconds = S.deep_sleep_seconds,
            rem_sleep_seconds = S.rem_sleep_seconds,
            light_sleep_seconds = S.light_sleep_seconds,
            awake_time_seconds = S.awake_time_seconds,
            sleep_efficiency_pct = S.sleep_efficiency_pct,
            restless_periods = S.restless_periods,
            sleep_latency_seconds = S.sleep_latency_seconds,
            sleep_timing_score = S.sleep_timing_score,
            bedtime_start = S.bedtime_start,
            bedtime_end = S.bedtime_end,
            readiness_score = S.readiness_score,
            temperature_deviation_celsius = S.temperature_deviation_celsius,
            activity_balance = S.activity_balance,
            body_temperature_contributor = S.body_temperature_contributor,
            hrv_balance = S.hrv_balance,
            previous_day_activity = S.previous_day_activity,
            previous_night = S.previous_night,
            recovery_index = S.recovery_index,
            resting_heart_rate_contributor = S.resting_heart_rate_contributor,
            sleep_balance = S.sleep_balance,
            sleep_regularity = S.sleep_regularity,
            temperature_score = S.temperature_score,
            activity_score = S.activity_score,
            steps = S.steps,
            active_calories = S.active_calories,
            total_calories = S.total_calories,
            target_calories = S.target_calories,
            target_distance_meters = S.target_distance_meters,
            inactivity_alerts = S.inactivity_alerts,
            high_activity_hours = S.high_activity_hours,
            medium_activity_hours = S.medium_activity_hours,
            low_activity_hours = S.low_activity_hours,
            resting_hours = S.resting_hours,
            non_wear_hours = S.non_wear_hours,
            average_met_minutes = S.average_met_minutes,
            high_activity_met_minutes = S.high_activity_met_minutes,
            medium_activity_met_minutes = S.medium_activity_met_minutes,
            low_activity_met_minutes = S.low_activity_met_minutes,
            sedentary_met_minutes = S.sedentary_met_minutes,
            average_hrv_ms = S.average_hrv_ms,
            resting_heart_rate_bpm = S.resting_heart_rate_bpm,
            lowest_heart_rate_bpm = S.lowest_heart_rate_bpm,
            day_summary = S.day_summary,
            resilience_level = S.resilience_level,
            stress_high_duration_seconds = S.stress_high_duration_seconds,
            recovery_time_seconds = S.recovery_time_seconds,
            daytime_recovery_time_seconds = S.daytime_recovery_time_seconds,
            ingestion_timestamp = CURRENT_TIMESTAMP()
        WHEN NOT MATCHED THEN
          INSERT (
            calendar_date,
            sleep_score, total_sleep_seconds, deep_sleep_seconds, rem_sleep_seconds,
            light_sleep_seconds, awake_time_seconds, sleep_efficiency_pct, restless_periods,
            sleep_latency_seconds, sleep_timing_score, bedtime_start, bedtime_end,
            readiness_score, temperature_deviation_celsius, activity_balance,
            body_temperature_contributor, hrv_balance, previous_day_activity, previous_night,
            recovery_index, resting_heart_rate_contributor, sleep_balance, sleep_regularity,
            temperature_score,
            activity_score, steps, active_calories, total_calories, target_calories,
            target_distance_meters, inactivity_alerts,
            high_activity_hours, medium_activity_hours, low_activity_hours, resting_hours, non_wear_hours,
            average_met_minutes, high_activity_met_minutes, medium_activity_met_minutes,
            low_activity_met_minutes, sedentary_met_minutes,
            average_hrv_ms, resting_heart_rate_bpm, lowest_heart_rate_bpm,
            day_summary, resilience_level, stress_high_duration_seconds, recovery_time_seconds,
            daytime_recovery_time_seconds,
            ingestion_timestamp
          )
          VALUES (
            S.calendar_date,
            S.sleep_score, S.total_sleep_seconds, S.deep_sleep_seconds, S.rem_sleep_seconds,
            S.light_sleep_seconds, S.awake_time_seconds, S.sleep_efficiency_pct, S.restless_periods,
            S.sleep_latency_seconds, S.sleep_timing_score, S.bedtime_start, S.bedtime_end,
            S.readiness_score, S.temperature_deviation_celsius, S.activity_balance,
            S.body_temperature_contributor, S.hrv_balance, S.previous_day_activity, S.previous_night,
            S.recovery_index, S.resting_heart_rate_contributor, S.sleep_balance, S.sleep_regularity,
            S.temperature_score,
            S.activity_score, S.steps, S.active_calories, S.total_calories, S.target_calories,
            S.target_distance_meters, S.inactivity_alerts,
            S.high_activity_hours, S.medium_activity_hours, S.low_activity_hours, S.resting_hours, S.non_wear_hours,
            S.average_met_minutes, S.high_activity_met_minutes, S.medium_activity_met_minutes,
            S.low_activity_met_minutes, S.sedentary_met_minutes,
            S.average_hrv_ms, S.resting_heart_rate_bpm, S.lowest_heart_rate_bpm,
            S.day_summary, S.resilience_level, S.stress_high_duration_seconds, S.recovery_time_seconds,
            S.daytime_recovery_time_seconds,
            CURRENT_TIMESTAMP()
          )
        """
        
        print("  Ejecutando MERGE...")
        merge_job = bq_client.query(merge_query)
        merge_result = merge_job.result()
        
        # Obtener estadísticas
        num_inserted = merge_result.num_dml_affected_rows if hasattr(merge_result, 'num_dml_affected_rows') else len(rows)
        print(f"  ✅ MERGE completado: {num_inserted} filas afectadas")
        
        # 4. Limpiar tabla temporal
        bq_client.delete_table(temp_table)
        print(f"  ✅ Tabla temporal eliminada")
        
        return num_inserted
        
    except Exception as e:
        print(f"  ❌ Error en MERGE: {e}")
        # Intentar limpiar tabla temporal
        try:
            bq_client.delete_table(temp_table)
        except:
            pass
        return 0

def process_user(bq_client, user):
    """Procesa un usuario completo (todos los endpoints)"""
    user_name = user['name']
    user_slug = user['slug']
    user_token = user['token']
    
    print(f"\n{'=' * 70}")
    print(f"👤 PROCESANDO USUARIO: {user_name} ({user_slug})")
    print(f"{'=' * 70}")
    
    # Calcular rango de fechas
    end_date = date.today()
    start_date = end_date - timedelta(days=LOOKBACK_DAYS)
    
    print(f"📅 Rango: {start_date} → {end_date} ({LOOKBACK_DAYS} días)")
    
    # 1. Obtener datos de sleep
    print("\n1️⃣ Obteniendo datos de SLEEP...")
    sleep_data = get_api_data("daily_sleep", user_token, str(start_date), str(end_date))
    print(f"  ✅ {len(sleep_data)} registros obtenidos")
    
    # 2. Obtener datos de readiness
    print("\n2️⃣ Obteniendo datos de READINESS...")
    readiness_data = get_api_data("daily_readiness", user_token, str(start_date), str(end_date))
    print(f"  ✅ {len(readiness_data)} registros obtenidos")
    
    # 3. Obtener datos de activity
    print("\n3️⃣ Obteniendo datos de ACTIVITY...")
    activity_data = get_api_data("daily_activity", user_token, str(start_date), str(end_date))
    print(f"  ✅ {len(activity_data)} registros obtenidos")
    
    # 4. Obtener datos de stress (si aplica)
    print("\n4️⃣ Obteniendo datos de STRESS...")
    stress_data = get_api_data("daily_stress", user_token, str(start_date), str(end_date))
    print(f"  ✅ {len(stress_data)} registros obtenidos")
    
    # 5. Combinar datos por fecha
    print("\n5️⃣ Combinando datos por fecha...")
    combined = {}
    
    for item in sleep_data:
        day = item['day']
        combined[day] = {
            'calendar_date': day,
            'sleep_score': item.get('score'),
            'total_sleep_seconds': item['contributors'].get('total_sleep_time'),
            'deep_sleep_seconds': item['contributors'].get('deep_sleep'),
            'rem_sleep_seconds': item['contributors'].get('rem_sleep'),
            'light_sleep_seconds': item['contributors'].get('light_sleep'),
            'awake_time_seconds': item['contributors'].get('awake_time'),
            'sleep_efficiency_pct': item['contributors'].get('sleep_efficiency'),
            'restless_periods': item['contributors'].get('restless_periods'),
            'sleep_latency_seconds': item['contributors'].get('latency'),
            'sleep_timing_score': item['contributors'].get('timing'),
            'bedtime_start': parse_time(item.get('bedtime_start')),
            'bedtime_end': parse_time(item.get('bedtime_end')),
        }
    
    for item in readiness_data:
        day = item['day']
        if day not in combined:
            combined[day] = {'calendar_date': day}
        combined[day].update({
            'readiness_score': item.get('score'),
            'temperature_deviation_celsius': item['contributors'].get('temperature_deviation'),
            'activity_balance': item['contributors'].get('activity_balance'),
            'body_temperature_contributor': item['contributors'].get('body_temperature'),
            'hrv_balance': item['contributors'].get('hrv_balance'),
            'previous_day_activity': item['contributors'].get('previous_day_activity'),
            'previous_night': item['contributors'].get('previous_night'),
            'recovery_index': item['contributors'].get('recovery_index'),
            'resting_heart_rate_contributor': item['contributors'].get('resting_heart_rate'),
            'sleep_balance': item['contributors'].get('sleep_balance'),
            'sleep_regularity': item['contributors'].get('sleep_regularity'),
            'temperature_score': item.get('temperature_trend_deviation'),
        })
    
    for item in activity_data:
        day = item['day']
        if day not in combined:
            combined[day] = {'calendar_date': day}
        combined[day].update({
            'activity_score': item.get('score'),
            'steps': item.get('steps'),
            'active_calories': item.get('active_calories'),
            'total_calories': item.get('total_calories'),
            'target_calories': item.get('target_calories'),
            'target_distance_meters': item.get('equivalent_walking_distance'),
            'inactivity_alerts': item.get('inactivity_alerts'),
            'high_activity_hours': item.get('high_activity_time') / 3600 if item.get('high_activity_time') else None,
            'medium_activity_hours': item.get('medium_activity_time') / 3600 if item.get('medium_activity_time') else None,
            'low_activity_hours': item.get('low_activity_time') / 3600 if item.get('low_activity_time') else None,
            'resting_hours': item.get('resting_time') / 3600 if item.get('resting_time') else None,
            'non_wear_hours': item.get('non_wear_time') / 3600 if item.get('non_wear_time') else None,
            'average_met_minutes': item.get('average_met_minutes'),
            'high_activity_met_minutes': item.get('high_activity_met_minutes'),
            'medium_activity_met_minutes': item.get('medium_activity_met_minutes'),
            'low_activity_met_minutes': item.get('low_activity_met_minutes'),
            'sedentary_met_minutes': item.get('sedentary_met_minutes'),
            'average_hrv_ms': item.get('average_heart_rate'),
            'resting_heart_rate_bpm': item.get('resting_heart_rate'),
            'lowest_heart_rate_bpm': item.get('lowest_heart_rate'),
        })
    
    for item in stress_data:
        day = item['day']
        if day not in combined:
            combined[day] = {'calendar_date': day}
        combined[day].update({
            'day_summary': item.get('day_summary'),
            'resilience_level': item.get('resilience_level'),
            'stress_high_duration_seconds': item.get('stress_high'),
            'recovery_time_seconds': item.get('recovery_high'),
            'daytime_recovery_time_seconds': item.get('daytime_recovery_high'),
        })
    
    rows = list(combined.values())
    print(f"  ✅ {len(rows)} días únicos combinados")
    
    # 6. Cargar a BigQuery
    print(f"\n6️⃣ Cargando a BigQuery (daily_biometrics_{user_slug})...")
    affected = merge_to_bigquery(bq_client, user_slug, rows)
    
    print(f"\n{'=' * 70}")
    print(f"✅ {user_name}: {affected} registros actualizados")
    print(f"{'=' * 70}")
    
    return {
        'user': user_name,
        'slug': user_slug,
        'days': len(rows),
        'affected': affected
    }

def main():
    """Función principal"""
    print("\n" + "=" * 70)
    print("🚀 OURA ETL v3 - MULTI-USUARIO")
    print("=" * 70)
    print(f"Proyecto: {PROJECT_ID}")
    print(f"Dataset: {DATASET_ID}")
    print(f"Lookback: {LOOKBACK_DAYS} días")
    print("=" * 70)
    
    # Cargar configuración de usuarios
    users = load_user_config()
    
    if not users:
        print("❌ No hay usuarios activos configurados")
        send_telegram("❌ ETL: No hay usuarios activos configurados")
        return
    
    print(f"\n📋 Usuarios activos: {len(users)}")
    for u in users:
        print(f"  • {u['name']} ({u['slug']})")
    
    # Inicializar cliente BigQuery
    bq_client = bigquery.Client(project=PROJECT_ID)
    
    # Procesar cada usuario
    results = []
    for user in users:
        try:
            result = process_user(bq_client, user)
            results.append(result)
        except Exception as e:
            print(f"\n❌ Error procesando {user['name']}: {e}")
            results.append({
                'user': user['name'],
                'slug': user['slug'],
                'error': str(e)
            })
    
    # Resumen final
    print("\n" + "=" * 70)
    print("📊 RESUMEN FINAL")
    print("=" * 70)
    
    success_count = 0
    total_affected = 0
    
    for r in results:
        if 'error' in r:
            print(f"❌ {r['user']}: Error - {r['error']}")
        else:
            print(f"✅ {r['user']}: {r['affected']} registros actualizados")
            success_count += 1
            total_affected += r['affected']
    
    print("=" * 70)
    print(f"Total exitosos: {success_count}/{len(users)}")
    print(f"Total registros: {total_affected}")
    print("=" * 70)
    
    # Notificación Telegram
    summary = f"✅ *ETL Completado*\n\n"
    for r in results:
        if 'error' in r:
            summary += f"❌ {r['user']}: Error\n"
        else:
            summary += f"✅ {r['user']}: {r['affected']} registros\n"
    summary += f"\n📊 Total: {total_affected} registros"
    
    send_telegram(summary)
    
    print("\n✅ ETL completado exitosamente")

if __name__ == "__main__":
    main()
