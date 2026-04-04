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
import numpy as np
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

def calculate_resting_heart_rate(hr_measurements):
    """Calcula resting HR desde mediciones intraday (percentil 5 de rest/sleep o todas)"""
    import numpy as np
    
    # Filtrar solo mediciones en reposo o sueño
    resting_bpms = [m['bpm'] for m in hr_measurements if m['source'] in ['rest', 'sleep'] and m['bpm'] > 0]
    
    # Si tenemos al menos 10 mediciones en reposo, usarlas
    if len(resting_bpms) >= 10:
        return int(np.percentile(resting_bpms, 5))
    
    # Si no, usar percentil 5 de TODAS las mediciones (menos workout)
    non_workout_bpms = [m['bpm'] for m in hr_measurements if m['source'] != 'workout' and m['bpm'] > 0]
    
    if len(non_workout_bpms) >= 10:
        return int(np.percentile(non_workout_bpms, 5))
    
    # Última opción: percentil 5 de todas (incluso workout)
    all_bpms = [m['bpm'] for m in hr_measurements if m['bpm'] > 0]
    if not all_bpms:
        return None
    
    return int(np.percentile(all_bpms, 5))

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
    """Verifica que la tabla del usuario exista. Si no existe, la crea automáticamente."""
    table_ref = f"{PROJECT_ID}.{DATASET_ID}.daily_biometrics_{table_slug}"
    
    # Intentar hacer query a la tabla para verificar existencia
    try:
        query = f"SELECT COUNT(*) as cnt FROM `{table_ref}` LIMIT 1"
        result = bq_client.query(query).result()
        print(f"  ✅ Tabla daily_biometrics_{table_slug} ya existe")
        return True
    except Exception as e:
        # Tabla no existe - intentar crearla
        if "not found" in str(e).lower():
            print(f"  ⚠️ Tabla daily_biometrics_{table_slug} no existe - creando...")
            try:
                # Crear tabla con schema completo (copiar del merge_to_bigquery)
                table = bigquery.Table(table_ref, schema=[
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
                    bigquery.SchemaField("sedentary_time_seconds", "INT64"),
                    bigquery.SchemaField("average_hrv_ms", "FLOAT64"),
                    bigquery.SchemaField("average_heart_rate", "FLOAT64"),
                    bigquery.SchemaField("resting_heart_rate_bpm", "INT64"),
                    bigquery.SchemaField("lowest_heart_rate_bpm", "INT64"),
                    bigquery.SchemaField("day_summary", "STRING"),
                    bigquery.SchemaField("resilience_level", "STRING"),
                    bigquery.SchemaField("stress_high_duration_seconds", "INT64"),
                    bigquery.SchemaField("recovery_time_seconds", "INT64"),
                    bigquery.SchemaField("daytime_recovery_time_seconds", "INT64"),
                ])
                bq_client.create_table(table)
                print(f"  ✅ Tabla daily_biometrics_{table_slug} creada exitosamente")
                return True
            except Exception as create_error:
                print(f"  ❌ Error creando tabla: {create_error}")
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
            bigquery.SchemaField("average_heart_rate", "FLOAT64"),
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
            average_heart_rate = S.average_heart_rate,
            resting_heart_rate_bpm = S.resting_heart_rate_bpm,
            lowest_heart_rate_bpm = S.lowest_heart_rate_bpm,
            day_summary = S.day_summary,
            resilience_level = S.resilience_level,
            stress_high_duration_seconds = S.stress_high_duration_seconds,
            recovery_time_seconds = S.recovery_time_seconds,
            daytime_recovery_time_seconds = S.daytime_recovery_time_seconds
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
            average_hrv_ms, average_heart_rate, resting_heart_rate_bpm, lowest_heart_rate_bpm,
            day_summary, resilience_level, stress_high_duration_seconds, recovery_time_seconds,
            daytime_recovery_time_seconds
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
            S.average_hrv_ms, S.average_heart_rate, S.resting_heart_rate_bpm, S.lowest_heart_rate_bpm,
            S.day_summary, S.resilience_level, S.stress_high_duration_seconds, S.recovery_time_seconds,
            S.daytime_recovery_time_seconds
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

def load_heart_rate_intraday(bq_client, user_slug, hr_by_day):
    """Carga mediciones de heart rate intraday a tabla separada"""
    if not hr_by_day:
        return 0
    
    table_name = f"heart_rate_intraday_{user_slug}"
    table_id = f"{PROJECT_ID}.{DATASET_ID}.{table_name}"
    
    # Schema para tabla intraday
    schema = [
        bigquery.SchemaField("calendar_date", "DATE"),
        bigquery.SchemaField("timestamp", "TIMESTAMP"),
        bigquery.SchemaField("bpm", "INT64"),
        bigquery.SchemaField("source", "STRING"),
    ]
    
    # Crear tabla si no existe
    try:
        table = bigquery.Table(table_id, schema=schema)
        table = bq_client.create_table(table, exists_ok=True)
        print(f"  ✅ Tabla {table_name} lista")
    except Exception as e:
        print(f"  ❌ Error creando tabla intraday: {e}")
        return 0
    
    # Preparar datos para inserción (solo últimos 7 días para no saturar)
    rows_to_insert = []
    from datetime import datetime as dt
    
    # Ordenar días y tomar solo los últimos 7
    sorted_days = sorted(hr_by_day.keys(), reverse=True)[:7]
    
    for day in sorted_days:
        measurements = hr_by_day[day]
        for m in measurements:
            rows_to_insert.append({
                'calendar_date': day,
                'timestamp': m['timestamp'],
                'bpm': m['bpm'],
                'source': m['source']
            })
    
    if not rows_to_insert:
        return 0
    
    # Insertar en BigQuery (reemplaza datos existentes de esos días)
    print(f"  📊 Insertando {len(rows_to_insert)} mediciones intraday (últimos 7 días)...")
    
    # Primero eliminar datos existentes de esos días
    days_str = "', '".join(sorted_days)
    delete_query = f"""
    DELETE FROM `{table_id}`
    WHERE calendar_date IN ('{days_str}')
    """
    try:
        bq_client.query(delete_query).result()
    except:
        pass  # Puede que la tabla esté vacía
    
    # Insertar nuevos datos
    try:
        errors = bq_client.insert_rows_json(table_id, rows_to_insert)
        if errors:
            print(f"  ❌ Errores en insert: {errors}")
            return 0
        print(f"  ✅ {len(rows_to_insert)} mediciones guardadas")
        return len(rows_to_insert)
    except Exception as e:
        print(f"  ❌ Error insertando intraday: {e}")
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
    print("\n1️⃣ Obteniendo datos de SLEEP (scores)...")
    sleep_data = get_api_data("daily_sleep", user_token, str(start_date), str(end_date))
    print(f"  ✅ {len(sleep_data)} registros obtenidos")
    
    # 1b. Obtener datos de SLEEP detallados (sesiones con horas)
    print("\n1️⃣b Obteniendo datos de SLEEP detallados (sesiones)...")
    sleep_sessions = get_api_data("sleep", user_token, str(start_date), str(end_date))
    print(f"  ✅ {len(sleep_sessions)} sesiones obtenidas")
    
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
    
    # 5. HEART RATE intraday deshabilitado (tarda mucho)
    # Si necesitas resting HR, descomenta esta sección
    resting_hr_by_day = {}  # Dict vacío
    
    # 5. Combinar datos por fecha
    print("\n6️⃣ Combinando datos por fecha...")
    combined = {}
    
    # Primero agregamos sesiones de sueño por día
    sleep_by_day = {}
    for session in sleep_sessions:
        day = session['day']
        if day not in sleep_by_day:
            sleep_by_day[day] = {
                'total_sleep_seconds': 0,
                'deep_sleep_seconds': 0,
                'rem_sleep_seconds': 0,
                'light_sleep_seconds': 0,
                'awake_time_seconds': 0,
                'latency_seconds': 0,
                'restless_periods': 0,
                'hrv_samples': [],
                'hr_samples': [],
                'lowest_hr_samples': []
            }
        # Sumar todas las sesiones del mismo día
        sleep_by_day[day]['total_sleep_seconds'] += session.get('total_sleep_duration', 0)
        sleep_by_day[day]['deep_sleep_seconds'] += session.get('deep_sleep_duration', 0)
        sleep_by_day[day]['rem_sleep_seconds'] += session.get('rem_sleep_duration', 0)
        sleep_by_day[day]['light_sleep_seconds'] += session.get('light_sleep_duration', 0)
        sleep_by_day[day]['awake_time_seconds'] += session.get('awake_time', 0)
        sleep_by_day[day]['latency_seconds'] += session.get('latency', 0)
        sleep_by_day[day]['restless_periods'] += session.get('restless_periods', 0)
        
        # Recolectar HRV
        if session.get('average_hrv'):
            sleep_by_day[day]['hrv_samples'].append(session['average_hrv'])
        
        # Recolectar Heart Rate
        if session.get('average_heart_rate') and session.get('average_heart_rate') > 0:
            sleep_by_day[day]['hr_samples'].append(session['average_heart_rate'])
        
        # Calcular lowest HR desde heart_rate.items array
        hr_data = session.get('heart_rate', {})
        if hr_data and hr_data.get('items'):
            # Filtrar valores no nulos y calcular mínimo
            hr_values = [v for v in hr_data['items'] if v is not None and v > 0]
            if hr_values:
                session_lowest = min(hr_values)
                sleep_by_day[day]['lowest_hr_samples'].append(session_lowest)
    
    # Ahora combinamos con los scores de daily_sleep
    for item in sleep_data:
        day = item['day']
        daily_totals = sleep_by_day.get(day, {})
        
        # Calcular promedios de HRV desde sesiones
        hrv_avg = None
        if daily_totals.get('hrv_samples'):
            hrv_avg = sum(daily_totals['hrv_samples']) / len(daily_totals['hrv_samples'])
        
        # Calcular promedios de HR desde sesiones
        hr_avg = None
        if daily_totals.get('hr_samples'):
            hr_avg = sum(daily_totals['hr_samples']) / len(daily_totals['hr_samples'])
        
        # Encontrar el lowest HR de todas las sesiones
        lowest_hr = None
        if daily_totals.get('lowest_hr_samples'):
            lowest_hr = int(min(daily_totals['lowest_hr_samples']))
        
        combined[day] = {
            'calendar_date': day,
            'sleep_score': item.get('score'),
            # Datos detallados de sesiones
            'total_sleep_seconds': daily_totals.get('total_sleep_seconds'),
            'deep_sleep_seconds': daily_totals.get('deep_sleep_seconds'),
            'rem_sleep_seconds': daily_totals.get('rem_sleep_seconds'),
            'light_sleep_seconds': daily_totals.get('light_sleep_seconds'),
            'awake_time_seconds': daily_totals.get('awake_time_seconds'),
            'sleep_latency_seconds': daily_totals.get('latency_seconds'),
            'restless_periods': daily_totals.get('restless_periods'),
            # Scores de contributors (0-100)
            'sleep_timing_score': item['contributors'].get('timing'),
            'sleep_efficiency_pct': None,  # Lo calcularemos después si hay datos
            'bedtime_start': parse_time(item.get('bedtime_start')),
            'bedtime_end': parse_time(item.get('bedtime_end')),
            # HRV y HR de sesiones
            'average_hrv_ms': hrv_avg,
            'average_heart_rate': hr_avg,
            'lowest_heart_rate_bpm': lowest_hr,
        }
        
        # Calcular eficiencia si tenemos los datos
        total_sleep = combined[day]['total_sleep_seconds']
        awake = combined[day]['awake_time_seconds']
        if total_sleep and awake is not None:
            total_time = total_sleep + awake
            if total_time > 0:
                combined[day]['sleep_efficiency_pct'] = int((total_sleep / total_time) * 100)
    
    for item in readiness_data:
        day = item['day']
        if day not in combined:
            combined[day] = {'calendar_date': day}
        
        resting_hr = resting_hr_by_day.get(day)
        
        combined[day].update({
            'readiness_score': item.get('score'),
            'temperature_deviation_celsius': item.get('temperature_deviation'),
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
            # Resting HR calculado desde mediciones intraday
            'resting_heart_rate_bpm': resting_hr,
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
            'sedentary_time_seconds': item.get('sedentary_time'),
            # average_hrv_ms ya viene de sleep sessions, no lo sobrescribimos
            # resting_heart_rate_bpm ya viene de readiness (calculado desde HR intraday), no lo sobrescribimos
            # lowest_heart_rate_bpm ya viene de sleep sessions (calculado desde heart_rate.items), no lo sobrescribimos
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
    
    # 6. Cargar a BigQuery (daily biometrics)
    print(f"\n6️⃣ Cargando a BigQuery (daily_biometrics_{user_slug})...")
    affected = merge_to_bigquery(bq_client, user_slug, rows)
    
    # 7. Cargar heart rate intraday a tabla separada
    # 7. Heart rate intraday deshabilitado
    intraday_count = 0
    
    print(f"\n{'=' * 70}")
    print(f"✅ {user_name}: {affected} registros actualizados")
    print(f"{'=' * 70}")
    
    return {
        'user': user_name,
        'slug': user_slug,
        'days': len(rows),
        'affected': affected,
        'intraday': intraday_count
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
