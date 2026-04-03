"""
Oura ETL con MERGE para evitar duplicados
Escribe a: daily_biometrics_v2
"""
import os
import requests
import time
import json
from datetime import datetime, date, timedelta
from google.cloud import bigquery

# --- CONFIGURACIÓN ---
OURA_TOKEN = os.getenv('OURA_TOKEN')
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
PROJECT_ID = os.getenv('GOOGLE_CLOUD_PROJECT', 'last-240000')
DATASET_ID = "oura_biometrics"
TABLE_ID = "daily_biometrics_v2"
LOOKBACK_DAYS = int(os.getenv('LOOKBACK_DAYS', '7'))

def send_telegram(msg):
    """Envía notificación a Telegram"""
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "Markdown"}, timeout=10)
    except Exception as e:
        print(f"Error enviando Telegram: {e}")

def get_api_data(endpoint, start_date, end_date):
    """Obtiene datos de Oura API con paginación"""
    url = f"https://api.ouraring.com/v2/usercollection/{endpoint}"
    params = {"start_date": start_date, "end_date": end_date}
    headers = {"Authorization": f"Bearer {OURA_TOKEN}"}
    
    all_items = []
    next_token = None
    
    while True:
        curr_params = params.copy()
        if next_token:
            curr_params['next_token'] = next_token
        
        try:
            resp = requests.get(url, params=curr_params, headers=headers, timeout=30)
            if resp.status_code == 429:
                print("Rate limit, esperando 2s...")
                time.sleep(2)
                continue
            if resp.status_code != 200:
                print(f"Error {resp.status_code} en {endpoint}: {resp.text}")
                break
            
            data = resp.json()
            all_items.extend(data.get('data', []))
            next_token = data.get('next_token')
            if not next_token:
                break
        except Exception as e:
            print(f"Excepción en API: {e}")
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

def merge_to_bigquery(bq_client, rows):
    """
    Usa MERGE para insertar/actualizar datos sin duplicados
    """
    if not rows:
        print("No hay datos para cargar")
        return
    
    table_ref = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"
    temp_table = f"{PROJECT_ID}.{DATASET_ID}.temp_oura_staging_{int(time.time())}"
    
    try:
        # 1. Crear tabla temporal con schema explícito
        print(f"Creando tabla temporal: {temp_table}")
        
        # Schema explícito para evitar type mismatch
        schema = [
            bigquery.SchemaField("calendar_date", "DATE"),
            bigquery.SchemaField("sleep_score", "INT64"),
            bigquery.SchemaField("total_sleep_seconds", "INT64"),
            bigquery.SchemaField("deep_sleep_seconds", "INT64"),
            bigquery.SchemaField("rem_sleep_seconds", "INT64"),
            bigquery.SchemaField("light_sleep_seconds", "INT64"),
            bigquery.SchemaField("awake_time_seconds", "INT64"),
            bigquery.SchemaField("sleep_efficiency_pct", "INT64"),
            bigquery.SchemaField("sleep_latency_seconds", "INT64"),
            bigquery.SchemaField("bed_time_start", "TIME"),
            bigquery.SchemaField("bed_time_end", "TIME"),
            bigquery.SchemaField("readiness_score", "INT64"),
            bigquery.SchemaField("temperature_deviation_celsius", "FLOAT64"),
            bigquery.SchemaField("resting_heart_rate_contributor", "INT64"),
            bigquery.SchemaField("average_hrv_ms", "FLOAT64"),
            bigquery.SchemaField("recovery_index", "INT64"),
            bigquery.SchemaField("hrv_balance", "INT64"),
            bigquery.SchemaField("activity_score", "INT64"),
            bigquery.SchemaField("steps", "INT64"),
            bigquery.SchemaField("active_calories", "INT64"),
            bigquery.SchemaField("total_calories", "INT64"),
            bigquery.SchemaField("low_activity_met_minutes", "INT64"),
            bigquery.SchemaField("medium_activity_met_minutes", "INT64"),
            bigquery.SchemaField("high_activity_met_minutes", "INT64"),
            bigquery.SchemaField("average_met_minutes", "FLOAT64"),
            bigquery.SchemaField("sedentary_time_seconds", "INT64"),
            bigquery.SchemaField("equivalent_walking_distance_meters", "INT64"),
            bigquery.SchemaField("average_heart_rate", "FLOAT64"),
            bigquery.SchemaField("lowest_heart_rate", "INT64"),
            bigquery.SchemaField("respiratory_rate_bpm", "FLOAT64")
        ]
        
        job_config = bigquery.LoadJobConfig(
            write_disposition="WRITE_TRUNCATE",
            source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
            schema=schema
        )
        
        load_job = bq_client.load_table_from_json(rows, temp_table, job_config=job_config)
        load_job.result()
        print(f"✅ Tabla temporal creada con {len(rows)} registros")
        
        # 2. MERGE desde tabla temporal a tabla principal
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
            sleep_latency_seconds = S.sleep_latency_seconds,
            bed_time_start = S.bed_time_start,
            bed_time_end = S.bed_time_end,
            readiness_score = S.readiness_score,
            temperature_deviation_celsius = S.temperature_deviation_celsius,
            resting_heart_rate_contributor = S.resting_heart_rate_contributor,
            average_hrv_ms = S.average_hrv_ms,
            recovery_index = S.recovery_index,
            activity_score = S.activity_score,
            steps = S.steps,
            active_calories = S.active_calories,
            total_calories = S.total_calories,
            low_activity_met_minutes = S.low_activity_met_minutes,
            medium_activity_met_minutes = S.medium_activity_met_minutes,
            high_activity_met_minutes = S.high_activity_met_minutes,
            average_met_minutes = S.average_met_minutes,
            sedentary_time_seconds = S.sedentary_time_seconds,
            equivalent_walking_distance_meters = S.equivalent_walking_distance_meters,
            average_heart_rate = S.average_heart_rate,
            lowest_heart_rate = S.lowest_heart_rate,
            respiratory_rate_bpm = S.respiratory_rate_bpm,
            ingestion_timestamp = CURRENT_TIMESTAMP()
        WHEN NOT MATCHED THEN
          INSERT (
            calendar_date,
            sleep_score, total_sleep_seconds, deep_sleep_seconds, rem_sleep_seconds,
            light_sleep_seconds, awake_time_seconds, sleep_efficiency_pct, sleep_latency_seconds,
            bed_time_start, bed_time_end,
            readiness_score, temperature_deviation_celsius, resting_heart_rate_contributor,
            average_hrv_ms, recovery_index,
            activity_score, steps, active_calories, total_calories,
            low_activity_met_minutes, medium_activity_met_minutes, high_activity_met_minutes, average_met_minutes,
            sedentary_time_seconds, equivalent_walking_distance_meters,
            average_heart_rate, lowest_heart_rate, respiratory_rate_bpm,
            ingestion_timestamp
          )
          VALUES (
            S.calendar_date,
            S.sleep_score, S.total_sleep_seconds, S.deep_sleep_seconds, S.rem_sleep_seconds,
            S.light_sleep_seconds, S.awake_time_seconds, S.sleep_efficiency_pct, S.sleep_latency_seconds,
            S.bed_time_start, S.bed_time_end,
            S.readiness_score, S.temperature_deviation_celsius, S.resting_heart_rate_contributor,
            S.average_hrv_ms, S.recovery_index,
            S.activity_score, S.steps, S.active_calories, S.total_calories,
            S.low_activity_met_minutes, S.medium_activity_met_minutes, S.high_activity_met_minutes, S.average_met_minutes,
            S.sedentary_time_seconds, S.equivalent_walking_distance_meters,
            S.average_heart_rate, S.lowest_heart_rate, S.respiratory_rate_bpm,
            CURRENT_TIMESTAMP()
          )
        """
        
        print("Ejecutando MERGE...")
        merge_job = bq_client.query(merge_query)
        merge_job.result()
        
        stats = merge_job.result()
        print(f"✅ MERGE completado - Filas afectadas: {merge_job.num_dml_affected_rows}")
        
        # 3. Limpiar tabla temporal
        bq_client.delete_table(temp_table, not_found_ok=True)
        print(f"🗑️ Tabla temporal eliminada")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en MERGE: {e}")
        # Limpiar tabla temporal en caso de error
        try:
            bq_client.delete_table(temp_table, not_found_ok=True)
        except:
            pass
        raise

def merge_to_daily_aggregates(bq_client, rows, readiness_data, activity_data):
    """
    Escribe a daily_aggregates (Bronze Layer) para compatibilidad con Gold Layer
    """
    table_ref = f"{PROJECT_ID}.{DATASET_ID}.daily_aggregates"
    temp_table = f"{PROJECT_ID}.{DATASET_ID}.temp_aggregates_staging_{int(time.time())}"
    
    try:
        # Mapear datos al formato de daily_aggregates
        aggregates_rows = []
        
        # Crear mapas rápidos por fecha
        readiness_map = {x.get('day'): x for x in readiness_data if x.get('day')}
        activity_map = {x.get('day'): x for x in activity_data if x.get('day')}
        
        for row in rows:
            day = row['calendar_date']
            readiness = readiness_map.get(day, {})
            activity = activity_map.get(day, {})
            
            readiness_contributors = readiness.get('contributors', {})
            activity_contributors = activity.get('contributors', {})
            
            agg_row = {
                "calendar_date": day,
                "ingestion_timestamp": datetime.now().isoformat(),
                
                # Readiness
                "readiness_score": row.get('readiness_score'),
                "readiness_temperature_deviation": row.get('temperature_deviation_celsius'),
                "readiness_temperature_trend_deviation": row.get('temperature_trend_deviation_celsius'),
                "readiness_contributor_activity_balance": readiness_contributors.get('activity_balance'),
                "readiness_contributor_body_temperature": readiness_contributors.get('body_temperature'),
                "readiness_contributor_hrv_balance": row.get('hrv_balance'),
                "readiness_contributor_previous_day_activity": readiness_contributors.get('previous_day_activity'),
                "readiness_contributor_previous_night": readiness_contributors.get('previous_night'),
                "readiness_contributor_recovery_index": row.get('recovery_index'),
                "readiness_contributor_resting_heart_rate": row.get('resting_heart_rate_contributor'),
                "readiness_contributor_sleep_balance": readiness_contributors.get('sleep_balance'),
                
                # Activity
                "activity_score": row.get('activity_score'),
                "activity_daily_movement": activity_contributors.get('daily_movement'),
                "activity_non_wear": None,
                "activity_resting_time": None,
                "activity_inactive_time": row.get('sedentary_time_seconds'),
                "activity_low_activity_time": None,
                "activity_medium_activity_time": None,
                "activity_high_activity_time": None,
                "activity_steps": row.get('steps'),
                "activity_equivalent_walking_distance": row.get('equivalent_walking_distance_meters'),
                "activity_total_calories": row.get('total_calories'),
                "activity_active_calories": row.get('active_calories'),
                "activity_average_met_minutes": row.get('average_met_minutes'),
                "activity_contributor_meet_daily_targets": activity_contributors.get('meet_daily_targets'),
                "activity_contributor_move_every_hour": activity_contributors.get('move_every_hour'),
                "activity_contributor_recovery_time": activity_contributors.get('recovery_time'),
                "activity_contributor_stay_active": activity_contributors.get('stay_active'),
                "activity_contributor_training_frequency": activity_contributors.get('training_frequency'),
                "activity_contributor_training_volume": activity_contributors.get('training_volume'),
                
                # Sleep
                "sleep_score": row.get('sleep_score'),
                "sleep_contributor_deep_sleep": None,
                "sleep_contributor_efficiency": None,
                "sleep_contributor_latency": None,
                "sleep_contributor_rem_sleep": None,
                "sleep_contributor_restfulness": None,
                "sleep_contributor_timing": None,
                "sleep_contributor_total_sleep": None,
                "sleep_total_sleep_duration": row.get('total_sleep_seconds'),
                "sleep_deep_sleep_duration": row.get('deep_sleep_seconds'),
                "sleep_light_sleep_duration": row.get('light_sleep_seconds'),
                "sleep_rem_sleep_duration": row.get('rem_sleep_seconds'),
                "sleep_awake_time": row.get('awake_time_seconds'),
                "sleep_bedtime_start": row.get('bed_time_start'),
                "sleep_bedtime_end": row.get('bed_time_end'),
                "sleep_efficiency": row.get('sleep_efficiency_pct'),
                "sleep_latency": row.get('sleep_latency_seconds'),
                "sleep_restless_periods": None,
                "sleep_average_hrv": row.get('average_hrv_ms'),
                "sleep_lowest_heart_rate": row.get('lowest_heart_rate'),
                "sleep_average_heart_rate": row.get('average_heart_rate'),
                "sleep_average_breath": row.get('respiratory_rate_bpm'),
                "sleep_regularity": None,
                
                # SPO2, Stress, Resilience (NULL por ahora)
                "spo2_percentage_average": None,
                "spo2_breathing_disturbance_index": None,
                "stress_day_summary": None,
                "stress_recovery_high": None,
                "stress_stressed_high": None,
                "resilience_level": row.get('resilience_level'),
                "resilience_sleep_recovery": None,
                "resilience_daytime_recovery": None,
                "resilience_stress": None,
                "cardiovascular_age": None,
                "vo2_max": None,
            }
            
            aggregates_rows.append(agg_row)
        
        # 1. Crear tabla temporal
        print(f"Creando tabla temporal: {temp_table}")
        job_config = bigquery.LoadJobConfig(
            write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
            autodetect=True,
        )
        
        load_job = bq_client.load_table_from_json(aggregates_rows, temp_table, job_config=job_config)
        load_job.result()
        print(f"✅ Tabla temporal creada con {len(aggregates_rows)} registros")
        
        # 2. MERGE desde tabla temporal a tabla principal
        merge_query = f"""
        MERGE `{table_ref}` T
        USING `{temp_table}` S
        ON T.calendar_date = S.calendar_date
        WHEN MATCHED THEN
          UPDATE SET
            readiness_score = S.readiness_score,
            activity_score = S.activity_score,
            sleep_score = S.sleep_score,
            activity_steps = S.activity_steps,
            activity_total_calories = S.activity_total_calories,
            readiness_temperature_deviation = S.readiness_temperature_deviation,
            readiness_contributor_resting_heart_rate = S.readiness_contributor_resting_heart_rate,
            readiness_contributor_recovery_index = S.readiness_contributor_recovery_index,
            readiness_contributor_hrv_balance = S.readiness_contributor_hrv_balance,
            sleep_total_sleep_duration = S.sleep_total_sleep_duration,
            sleep_deep_sleep_duration = S.sleep_deep_sleep_duration,
            sleep_rem_sleep_duration = S.sleep_rem_sleep_duration,
            sleep_light_sleep_duration = S.sleep_light_sleep_duration,
            sleep_efficiency = S.sleep_efficiency,
            sleep_latency = S.sleep_latency,
            sleep_bedtime_start = S.sleep_bedtime_start,
            sleep_bedtime_end = S.sleep_bedtime_end,
            sleep_average_heart_rate = S.sleep_average_heart_rate,
            sleep_lowest_heart_rate = S.sleep_lowest_heart_rate,
            sleep_average_breath = S.sleep_average_breath,
            sleep_average_hrv = S.sleep_average_hrv,
            ingestion_timestamp = CURRENT_TIMESTAMP()
        WHEN NOT MATCHED THEN
          INSERT (
            calendar_date, ingestion_timestamp,
            readiness_score, activity_score, sleep_score,
            activity_steps, activity_total_calories,
            readiness_temperature_deviation,
            readiness_contributor_resting_heart_rate,
            readiness_contributor_recovery_index,
            readiness_contributor_hrv_balance,
            sleep_total_sleep_duration, sleep_deep_sleep_duration,
            sleep_rem_sleep_duration, sleep_light_sleep_duration,
            sleep_efficiency, sleep_latency,
            sleep_bedtime_start, sleep_bedtime_end,
            sleep_average_heart_rate, sleep_lowest_heart_rate,
            sleep_average_breath, sleep_average_hrv
          )
          VALUES (
            S.calendar_date, CURRENT_TIMESTAMP(),
            S.readiness_score, S.activity_score, S.sleep_score,
            S.activity_steps, S.activity_total_calories,
            S.readiness_temperature_deviation,
            S.readiness_contributor_resting_heart_rate,
            S.readiness_contributor_recovery_index,
            S.readiness_contributor_hrv_balance,
            S.sleep_total_sleep_duration, S.sleep_deep_sleep_duration,
            S.sleep_rem_sleep_duration, S.sleep_light_sleep_duration,
            S.sleep_efficiency, S.sleep_latency,
            S.sleep_bedtime_start, S.sleep_bedtime_end,
            S.sleep_average_heart_rate, S.sleep_lowest_heart_rate,
            S.sleep_average_breath, S.sleep_average_hrv
          )
        """
        
        print("Ejecutando MERGE a daily_aggregates...")
        merge_job = bq_client.query(merge_query)
        merge_job.result()
        
        print(f"✅ MERGE a daily_aggregates completado - Filas afectadas: {merge_job.num_dml_affected_rows}")
        
        # 3. Limpiar tabla temporal
        bq_client.delete_table(temp_table, not_found_ok=True)
        print(f"🗑️ Tabla temporal eliminada")
        
    except Exception as e:
        print(f"❌ Error en MERGE a daily_aggregates: {e}")
        bq_client.delete_table(temp_table, not_found_ok=True)
        # No lanzar excepción - daily_biometrics_v2 ya se escribió correctamente
        print("⚠️ Continuando (daily_biometrics_v2 ya está actualizado)")

def main():
    """Pipeline principal"""
    print("=== Oura ETL v2 (MERGE) ===")
    print(f"Proyecto: {PROJECT_ID}")
    print(f"Tabla: {DATASET_ID}.{TABLE_ID}")
    print(f"Lookback: {LOOKBACK_DAYS} días")
    
    if not OURA_TOKEN:
        raise ValueError("OURA_TOKEN no configurado")
    
    bq = bigquery.Client(project=PROJECT_ID)
    
    # Calcular rango de fechas
    end_date = date.today()
    start_date = end_date - timedelta(days=LOOKBACK_DAYS)
    start_str = start_date.isoformat()
    end_str = end_date.isoformat()
    
    print(f"Rango: {start_str} a {end_str}")
    
    # 1. OBTENER DATOS DE OURA API
    print("\n📥 Obteniendo datos de Oura API...")
    sleep_scores = get_api_data('daily_sleep', start_str, end_str)
    sleep_sessions = get_api_data('sleep', start_str, end_str)  # Sesiones detalladas
    readiness_data = get_api_data('daily_readiness', start_str, end_str)
    activity_data = get_api_data('daily_activity', start_str, end_str)
    
    print(f"Sleep scores: {len(sleep_scores)} registros")
    print(f"Sleep sessions: {len(sleep_sessions)} registros")
    print(f"Readiness: {len(readiness_data)} registros")
    print(f"Activity: {len(activity_data)} registros")
    
    # 2. AGRUPAR POR FECHA
    daily_map = {}
    
    # Primero: Sleep scores (solo scores)
    for x in sleep_scores:
        day = x.get('day')
        if not day:
            continue
        if day not in daily_map:
            daily_map[day] = {"calendar_date": day}
        daily_map[day].update({
            "sleep_score": int(x.get('score')) if x.get('score') is not None else None,
        })
    
    # Segundo: Sleep sessions (detalles completos) - priorizar 'long_sleep'
    for x in sleep_sessions:
        day = x.get('day')
        if not day:
            continue
        if day not in daily_map:
            daily_map[day] = {"calendar_date": day}
        
        # Solo usar 'long_sleep' o si no hay tipo especificado
        sleep_type = x.get('type', 'long_sleep')
        if sleep_type != 'long_sleep' and 'total_sleep_seconds' in daily_map[day]:
            continue  # Ya tenemos un long_sleep, skip naps/rest
        
        daily_map[day].update({
            "total_sleep_seconds": int(x.get('total_sleep_duration')) if x.get('total_sleep_duration') is not None else None,
            "deep_sleep_seconds": int(x.get('deep_sleep_duration')) if x.get('deep_sleep_duration') is not None else None,
            "rem_sleep_seconds": int(x.get('rem_sleep_duration')) if x.get('rem_sleep_duration') is not None else None,
            "light_sleep_seconds": int(x.get('light_sleep_duration')) if x.get('light_sleep_duration') is not None else None,
            "awake_time_seconds": int(x.get('awake_time')) if x.get('awake_time') is not None else None,
            "sleep_efficiency_pct": int(x.get('efficiency')) if x.get('efficiency') is not None else None,
            "sleep_latency_seconds": int(x.get('latency')) if x.get('latency') is not None else None,
            "bed_time_start": parse_time(x.get('bedtime_start')),
            "bed_time_end": parse_time(x.get('bedtime_end')),
            "average_heart_rate": float(x.get('average_heart_rate')) if x.get('average_heart_rate') is not None else None,
            "lowest_heart_rate": int(x.get('lowest_heart_rate')) if x.get('lowest_heart_rate') is not None else None,
            "respiratory_rate_bpm": float(x.get('average_breath')) if x.get('average_breath') is not None else None,
            "average_hrv_ms": float(x.get('average_hrv')) if x.get('average_hrv') is not None else None,
        })
    
    for x in readiness_data:
        day = x.get('day')
        if not day:
            continue
        if day not in daily_map:
            daily_map[day] = {"calendar_date": day}
        
        contributors = x.get('contributors', {})
        daily_map[day].update({
            "readiness_score": int(x.get('score')) if x.get('score') is not None else None,
            "temperature_deviation_celsius": float(x.get('temperature_deviation')) if x.get('temperature_deviation') is not None else None,
            "resting_heart_rate_contributor": int(contributors.get('resting_heart_rate')) if contributors.get('resting_heart_rate') is not None else None,
            "recovery_index": int(contributors.get('recovery_index')) if contributors.get('recovery_index') is not None else None,
            "hrv_balance": int(contributors.get('hrv_balance')) if contributors.get('hrv_balance') is not None else None,
            # average_hrv_ms NO disponible en API v2 - dejar NULL
            "average_hrv_ms": None
        })
    
    for x in activity_data:
        day = x.get('day')
        if not day:
            continue
        if day not in daily_map:
            daily_map[day] = {"calendar_date": day}
        
        daily_map[day].update({
            "activity_score": int(x.get('score')) if x.get('score') is not None else None,
            "steps": int(x.get('steps')) if x.get('steps') is not None else None,
            "active_calories": int(x.get('active_calories')) if x.get('active_calories') is not None else None,
            "total_calories": int(x.get('total_calories')) if x.get('total_calories') is not None else None,
            "low_activity_met_minutes": int(x.get('low_activity_met_minutes')) if x.get('low_activity_met_minutes') is not None else None,
            "medium_activity_met_minutes": int(x.get('medium_activity_met_minutes')) if x.get('medium_activity_met_minutes') is not None else None,
            "high_activity_met_minutes": int(x.get('high_activity_met_minutes')) if x.get('high_activity_met_minutes') is not None else None,
            "average_met_minutes": float(x.get('average_met_minutes')) if x.get('average_met_minutes') is not None else None,
            "sedentary_time_seconds": int(x.get('sedentary_time')) if x.get('sedentary_time') is not None else None,
            "equivalent_walking_distance_meters": int(x.get('equivalent_walking_distance')) if x.get('equivalent_walking_distance') is not None else None
        })
    
    rows = list(daily_map.values())
    rows.sort(key=lambda k: k['calendar_date'])
    
    print(f"\n📦 Total días a procesar: {len(rows)}")
    
    # 3. MERGE A BIGQUERY (daily_biometrics_v2)
    if rows:
        print("\n🔄 Iniciando MERGE a BigQuery...")
        merge_to_bigquery(bq, rows)
        
        # 4. MERGE A daily_aggregates (para compatibilidad con Gold Layer)
        print("\n🔄 Escribiendo a daily_aggregates...")
        merge_to_daily_aggregates(bq, rows, readiness_data, activity_data)
        
        latest = rows[-1]
        msg = (
            f"✅ *Oura ETL v2 (MERGE)*\n"
            f"📅 `{latest['calendar_date']}`\n"
            f"😴 Sleep: {latest.get('sleep_score', 'N/A')} | "
            f"⚡ Ready: {latest.get('readiness_score', 'N/A')}\n"
            f"🏃 Steps: {latest.get('steps', 'N/A')}\n"
            f"📦 {len(rows)} días procesados (sin duplicados)"
        )
        send_telegram(msg)
        print("\n✅ ETL completado exitosamente")
    else:
        print("\n⚠️ No hay datos para cargar")

if __name__ == "__main__":
    main()
