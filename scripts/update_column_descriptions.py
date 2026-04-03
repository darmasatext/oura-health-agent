#!/usr/bin/env python3
"""
Script para actualizar descripciones de columnas en BigQuery
Mantiene los tipos exactos, solo actualiza las descripciones
"""

from google.cloud import bigquery
import json

PROJECT_ID = "last-240000"

# Diccionario de descripciones por tabla
DESCRIPTIONS = {
    "daily_biometrics_v2": {
        "calendar_date": "Fecha del día (timezone CST). Clave primaria de la tabla.",
        "ingestion_timestamp": "Timestamp UTC de cuando se ingirió este registro en BigQuery.",
        "sleep_score": "Calidad de sueño (0-100). Algoritmo Oura que considera duración, eficiencia, fases y recuperación.",
        "readiness_score": "Nivel de recuperación (0-100). Indica qué tan listo está el cuerpo para actividad física.",
        "activity_score": "Nivel de actividad (0-100). Evalúa movimiento, calorías, pasos y cumplimiento de objetivos.",
        "total_sleep_seconds": "Horas totales de sueño en segundos. Incluye todas las fases (deep + REM + light).",
        "rem_sleep_seconds": "Sueño REM (Rapid Eye Movement) en segundos. Fase de sueños y consolidación de memoria.",
        "deep_sleep_seconds": "Sueño profundo en segundos. Fase de reparación física y recuperación muscular.",
        "light_sleep_seconds": "Sueño ligero en segundos. Transición entre fases, parte del ciclo normal.",
        "awake_time_seconds": "Tiempo despierto en cama en segundos. Incluye despertares durante la noche.",
        "sleep_efficiency_pct": "Eficiencia del sueño (0-100%). Ratio de tiempo dormido vs tiempo en cama.",
        "sleep_latency_seconds": "Tiempo para dormirse en segundos. Desde que se acuesta hasta que entra en sueño.",
        "bed_time_start": "Timestamp UTC de cuando se acostó. Inicio del período de descanso.",
        "bed_time_end": "Timestamp UTC de cuando se levantó. Fin del período de descanso.",
        "average_heart_rate": "Frecuencia cardíaca promedio en latidos por minuto (bpm) durante todo el día.",
        "lowest_heart_rate": "Frecuencia cardíaca en reposo más baja en bpm. Indicador de salud cardiovascular.",
        "average_hrv_ms": "Variabilidad del ritmo cardíaco promedio en milisegundos. Mayor HRV = mejor recuperación.",
        "respiratory_rate_bpm": "Ritmo respiratorio en respiraciones por minuto durante el sueño.",
        "temperature_deviation_celsius": "Desviación de temperatura corporal en °C respecto a la línea base personal.",
        "temperature_trend_deviation_celsius": "Tendencia de desviación de temperatura en °C. Suaviza variaciones diarias.",
        "steps": "Pasos totales caminados durante el día.",
        "equivalent_walking_distance_meters": "Distancia equivalente caminada en metros. Basado en pasos y longitud de zancada.",
        "meters_to_target": "Metros faltantes para alcanzar el objetivo diario de movimiento.",
        "target_meters": "Objetivo diario de distancia en metros configurado en la app Oura.",
        "active_calories": "Calorías quemadas en actividad física (excluye metabolismo basal).",
        "total_calories": "Calorías totales quemadas (actividad + metabolismo basal).",
        "sedentary_time_seconds": "Tiempo sedentario (sentado/inactivo) en segundos durante el día.",
        "resting_time_seconds": "Tiempo en reposo consciente en segundos (ej: meditación, lectura).",
        "inactive_time_seconds": "Tiempo inactivo en segundos (sin movimiento significativo).",
        "low_activity_time_seconds": "Tiempo en actividad ligera en segundos (ej: caminar despacio).",
        "medium_activity_time_seconds": "Tiempo en actividad moderada en segundos (ej: caminar rápido).",
        "high_activity_time_seconds": "Tiempo en actividad intensa en segundos (ej: correr, ejercicio intenso).",
        "met_minutes_low": "Minutos de equivalente metabólico (MET) en actividad baja. 1 MET = metabolismo en reposo.",
        "met_minutes_medium_plus": "Minutos MET en actividad media o alta. Indicador de intensidad de ejercicio.",
        "training_frequency": "Frecuencia de entrenamiento calculada por Oura (low/moderate/high).",
        "training_volume_mets": "Volumen de entrenamiento en METs. Suma ponderada de intensidad × duración.",
        "spo2_percentage_average": "Saturación de oxígeno promedio (SpO2) en porcentaje durante el sueño.",
        "breathing_disturbance_index": "Índice de perturbaciones respiratorias durante el sueño. Menor es mejor.",
        "stress_high_seconds": "Tiempo en estado de estrés alto en segundos durante el día.",
        "recovery_high_seconds": "Tiempo en estado de recuperación alto en segundos. Sistema nervioso relajado.",
        "day_summary_stress": "Resumen del día en términos de estrés (restored/normal/stressful).",
        "resilience_level": "Nivel de resiliencia (strong/moderate/limited). Capacidad de recuperación del cuerpo.",
        "cardiovascular_age": "Edad cardiovascular estimada basada en métricas de salud cardíaca.",
        "vo2_max": "VO2 Max estimado en ml/kg/min. Capacidad aeróbica máxima del cuerpo.",
        "restful_periods": "Número de períodos de descanso detectados durante el día.",
        "sleep_type": "Tipo de sueño detectado (long_sleep/sleep/late_nap/rest).",
        "user_id": "ID del usuario Oura. Para soporte multi-usuario (actualmente solo 1 usuario).",
        "data_source": "Fuente de datos (oura_api_v2). Para auditoría y troubleshooting.",
    }
}

def update_table_descriptions(client, dataset_id, table_id, descriptions):
    """Actualiza las descripciones de las columnas de una tabla"""
    
    table_ref = client.dataset(dataset_id).table(table_id)
    table = client.get_table(table_ref)
    
    # Crear nuevo esquema con descripciones actualizadas
    new_schema = []
    updated_count = 0
    
    for field in table.schema:
        # Buscar descripción para esta columna
        description = descriptions.get(field.name, field.description)
        
        # Crear nuevo SchemaField con descripción actualizada
        new_field = bigquery.SchemaField(
            name=field.name,
            field_type=field.field_type,
            mode=field.mode,
            description=description,
            fields=field.fields
        )
        
        new_schema.append(new_field)
        
        if description and description != field.description:
            updated_count += 1
            print(f"  ✓ {field.name}: {description[:60]}...")
    
    # Actualizar tabla con nuevo esquema
    table.schema = new_schema
    table = client.update_table(table, ["schema"])
    
    return updated_count

def main():
    client = bigquery.Client(project=PROJECT_ID)
    
    print("📝 Actualizando descripciones de columnas en BigQuery...")
    print("")
    
    total_updated = 0
    
    # 1. daily_biometrics_v2
    print("1️⃣  daily_biometrics_v2...")
    count = update_table_descriptions(
        client, 
        "oura_biometrics", 
        "daily_biometrics_v2",
        DESCRIPTIONS["daily_biometrics_v2"]
    )
    total_updated += count
    print(f"✅ {count} columnas actualizadas")
    print("")
    
    # 2. Actualizar descripción de la tabla
    print("2️⃣  Actualizando descripción de la tabla...")
    table_ref = client.dataset("oura_biometrics").table("daily_biometrics_v2")
    table = client.get_table(table_ref)
    table.description = (
        "Tabla principal (Silver Layer). Datos diarios agregados de Oura Ring con métricas de "
        "sueño, recuperación, actividad y salud. Fuente única de verdad para el dashboard. "
        "ETL v2 con MERGE anti-duplicados. Actualización: 7:00 AM y 7:00 PM CST."
    )
    client.update_table(table, ["description"])
    print("✅ Descripción de tabla actualizada")
    print("")
    
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✅ DOCUMENTACIÓN COMPLETADA: {total_updated} columnas actualizadas")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("")
    print("Para verificar en BigQuery Console:")
    print(f"https://console.cloud.google.com/bigquery?project={PROJECT_ID}&ws=!1m5!1m4!4m3!1s{PROJECT_ID}!2soura_biometrics!3sdaily_biometrics_v2")

if __name__ == "__main__":
    main()
