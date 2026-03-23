import os
import requests
import time
from datetime import datetime, date, timedelta
from google.cloud import bigquery

# --- CONFIGURACIÓN ---
OURA_TOKEN = os.getenv('OURA_TOKEN')
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
PROJECT_ID = "last-240000"
DATASET_ID = "oura_biometrics"
TABLE_ID = "daily_biometrics_gold"

# MANTENER EN 90 PARA RELLENAR TU TABLA NUEVA, LUEGO BAJAR A 7
LOOKBACK_DAYS = 90

def send_telegram(msg):
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID: return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "Markdown"})
    except: pass

def get_api_data(endpoint, start_date, end_date):
    url = f"https://api.ouraring.com/v2/usercollection/{endpoint}"
    params = {"start_date": start_date, "end_date": end_date}
    headers = {"Authorization": f"Bearer {OURA_TOKEN}"}
    
    all_items = []
    next_token = None
    
    while True:
        curr_params = params.copy()
        if next_token: curr_params['next_token'] = next_token
        
        try:
            resp = requests.get(url, params=curr_params, headers=headers)
            if resp.status_code == 429:
                time.sleep(2)
                continue
            if resp.status_code != 200:
                print(f"Error {resp.status_code} en {endpoint}")
                break
            
            data = resp.json()
            all_items.extend(data.get('data', []))
            next_token = data.get('next_token')
            if not next_token: break
        except Exception as e:
            print(f"Excepción en {endpoint}: {e}")
            break
            
    return all_items

def parse_time(iso_str):
    if not iso_str: return None
    try: return datetime.fromisoformat(iso_str).strftime('%H:%M:%S')
    except: return None

def run_lite_pipeline():
    bq = bigquery.Client(project=PROJECT_ID)
    today = date.today()
    start_dt = today - timedelta(days=LOOKBACK_DAYS)
    start_str, end_str = start_dt.isoformat(), today.isoformat()
    
    print(f"🚀 Oura v17 LITE ({start_str} a {end_str})...")

    # 1. EXTRACCIÓN (Solo lo esencial)
    d_sleep_score = get_api_data("daily_sleep", start_str, end_str)
    d_activity = get_api_data("daily_activity", start_str, end_str)
    d_readiness = get_api_data("daily_readiness", start_str, end_str)
    d_stress = get_api_data("daily_stress", start_str, end_str)
    d_resilience = get_api_data("daily_resilience", start_str, end_str)
    d_sleep_details = get_api_data("sleep", start_str, end_str) # Para tiempos exactos

    current_ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 2. CONSOLIDACIÓN
    daily_map = {}
    
    # Recolectar todas las fechas posibles
    all_dates = set()
    for ds in [d_sleep_score, d_activity, d_readiness, d_stress, d_resilience, d_sleep_details]:
        for item in ds: all_dates.add(item['day'])

    for day in all_dates:
        daily_map[day] = {
            "calendar_date": day,
            "ingestion_timestamp": current_ts,
            # Placeholders
            "sleep_score": None, "readiness_score": None, "activity_score": None,
            "resilience_level": None, "total_sleep_seconds": None, "rem_sleep_seconds": None,
            "deep_sleep_seconds": None, "light_sleep_seconds": None, "awake_time_seconds": None,
            "sleep_efficiency_pct": None, "sleep_latency_seconds": None,
            "bed_time_start": None, "bed_time_end": None,
            "average_heart_rate": None, "lowest_heart_rate": None,
            "respiratory_rate_bpm": None, "temperature_deviation_celsius": None,
            "day_summary": None, "steps": None, "active_calories": None,
            "total_calories": None, "sedentary_time_seconds": None,
            "equivalent_walking_distance_meters": None
        }

    # Llenado de Datos
    for x in d_sleep_score: daily_map[x['day']]['sleep_score'] = x.get('score')
    for x in d_resilience:  daily_map[x['day']]['resilience_level'] = x.get('level')
    for x in d_stress:      daily_map[x['day']]['day_summary'] = x.get('day_summary')
    
    for x in d_activity:
        if x['day'] in daily_map:
            daily_map[x['day']].update({
                "activity_score": x.get('score'),
                "steps": x.get('steps'),
                "active_calories": x.get('active_calories'),
                "total_calories": x.get('total_calories'),
                "sedentary_time_seconds": x.get('sedentary_time'),
                "equivalent_walking_distance_meters": x.get('equivalent_walking_distance')
            })

    for x in d_readiness:
        if x['day'] in daily_map:
            daily_map[x['day']].update({
                "readiness_score": x.get('score'),
                "temperature_deviation_celsius": x.get('temperature_deviation')
            })

    # Detalle de sueño (Prioridad 'long_sleep')
    for x in d_sleep_details:
        day = x.get('day')
        if day in daily_map and x.get('type') == 'long_sleep':
            daily_map[day].update({
                "total_sleep_seconds": x.get('total_sleep_duration'),
                "rem_sleep_seconds": x.get('rem_sleep_duration'),
                "deep_sleep_seconds": x.get('deep_sleep_duration'),
                "light_sleep_seconds": x.get('light_sleep_duration'),
                "awake_time_seconds": x.get('awake_time'),
                "sleep_efficiency_pct": x.get('efficiency'),
                "sleep_latency_seconds": x.get('latency'),
                "bed_time_start": parse_time(x.get('bedtime_start')),
                "bed_time_end": parse_time(x.get('bedtime_end')),
                "average_heart_rate": x.get('average_heart_rate'),
                "lowest_heart_rate": x.get('lowest_heart_rate'),
                "respiratory_rate_bpm": x.get('average_breath')
            })

    rows = list(daily_map.values())
    rows.sort(key=lambda k: k['calendar_date'])

    # 3. CARGA A BIGQUERY
    if rows:
        table_ref = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"
        
        # Borrar datos previos en el rango para evitar duplicados
        bq.query(f"DELETE FROM `{table_ref}` WHERE calendar_date >= '{start_str}'").result()
        
        job_config = bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND",
            source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        )
        try:
            bq.load_table_from_json(rows, table_ref, job_config=job_config).result()
            latest = rows[-1]
            msg = (
                f"✅ *Oura Lite Sync*\n"
                f"📅 `{latest['calendar_date']}`\n"
                f"😴 Sleep: {latest['sleep_score']} | ⚡ Ready: {latest['readiness_score']}\n"
                f"🏃 Steps: {latest['steps']}\n"
                f"📦 {len(rows)} días procesados."
            )
            send_telegram(msg)
            print("Carga Exitosa.")
        except Exception as e:
            err = f"Error BigQuery: {e}"
            print(err)
            send_telegram(f"❌ {err}")
    else:
        print("No hay datos para cargar.")

if __name__ == "__main__":
    run_lite_pipeline()