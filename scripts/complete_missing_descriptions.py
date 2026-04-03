#!/usr/bin/env python3
"""
Script para completar SOLO las descripciones faltantes en daily_biometrics_v2
Mantiene las descripciones existentes y su estilo con emojis
"""

from google.cloud import bigquery

PROJECT_ID = "last-240000"
DATASET_ID = "oura_biometrics"
TABLE_ID = "daily_biometrics_v2"

# Descripciones solo para columnas que NO tienen descripción
# Siguiendo el estilo existente: emojis, rangos, estrellas
MISSING_DESCRIPTIONS = {
    # Métricas de sueño
    "total_sleep_seconds": "Tiempo total dormido en segundos. Rango: 14400-36000s (4-10h). Incluye deep+REM+light. ⭐⭐⭐⭐⭐",
    "rem_sleep_seconds": "Sueño REM en segundos. Rango: 5400-10800s (1.5-3h). Fase de sueños y memoria. ⭐⭐⭐⭐",
    "deep_sleep_seconds": "Sueño profundo en segundos. Rango: 3600-7200s (1-2h). Reparación física. ⭐⭐⭐⭐⭐",
    "light_sleep_seconds": "Sueño ligero en segundos. Rango: 10800-21600s (3-6h). Transición entre fases. ⭐⭐⭐",
    "awake_time_seconds": "Tiempo despierto en cama (segundos). Menor es mejor. Incluye despertares nocturnos. ⭐⭐⭐",
    "sleep_efficiency_pct": "Eficiencia del sueño (%). Rango: 0-100 (óptimo: 85-100). Tiempo dormido vs tiempo en cama. ⭐⭐⭐⭐⭐",
    "sleep_latency_seconds": "Latencia de sueño (segundos). Tiempo para dormirse. Rango: 0-3600s (óptimo: <900s). ⭐⭐⭐",
    "bed_time_start": "⏰ Timestamp UTC de acostarse. Inicio del período de descanso.",
    "bed_time_end": "⏰ Timestamp UTC de levantarse. Fin del período de descanso.",
    
    # Métricas cardíacas
    "average_heart_rate": "Frecuencia cardíaca promedio (bpm) durante 24h. Rango: 40-100bpm. ⭐⭐⭐⭐",
    "lowest_heart_rate": "FC en reposo más baja (bpm). Rango: 35-70bpm (menor = mejor fitness). ⭐⭐⭐⭐⭐",
    
    # Temperatura y respiración
    "respiratory_rate_bpm": "Frecuencia respiratoria (resp/min) durante sueño. Rango: 12-20 rpm. ⭐⭐⭐",
    "temperature_deviation_celsius": "🌡️ Desviación de temperatura (°C) vs línea base. Rango: -2.0 a +2.0°C. ⭐⭐⭐⭐",
    "temperature_trend_deviation_celsius": "🌡️ Tendencia de temperatura (°C). Suaviza variaciones diarias. Rango: -1.5 a +1.5°C. ⭐⭐⭐",
    
    # Actividad física
    "steps": "🚶 Pasos totales del día. Rango: 0-50000 (meta: 10000+). ⭐⭐⭐⭐⭐",
    "active_calories": "🔥 Calorías activas (excluye metabolismo basal). Rango: 0-3000 kcal. ⭐⭐⭐⭐",
    "total_calories": "🔥 Calorías totales (actividad + basal). Rango: 1200-4000 kcal/día. ⭐⭐⭐⭐",
    "sedentary_time_seconds": "⏱️ Tiempo sedentario en segundos. Menor es mejor. Rango: 0-86400s (0-24h). ⭐⭐⭐",
    "equivalent_walking_distance_meters": "📏 Distancia equivalente caminada (metros). Basado en pasos + zancada. ⭐⭐⭐",
    "target_meters": "🎯 Objetivo diario de distancia (metros) configurado en app. ⭐⭐",
    "meters_to_target": "📊 Metros faltantes para alcanzar objetivo diario. Negativo = superado. ⭐⭐",
    
    # Horas de actividad
    "high_activity_hours": "💪 Horas en actividad intensa (decimal). Rango: 0-6h/día. ⭐⭐⭐⭐",
    "medium_activity_hours": "🚶‍♂️ Horas en actividad moderada (decimal). Rango: 0-12h/día. ⭐⭐⭐",
    "low_activity_hours": "🚶 Horas en actividad ligera (decimal). Rango: 0-18h/día. ⭐⭐",
    "resting_hours": "🧘 Horas en reposo consciente (decimal). Meditación, lectura, etc. ⭐⭐⭐",
    "non_wear_hours": "⌚ Horas sin llevar el anillo (decimal). Afecta precisión de datos. ⚠️",
    
    # MET (Equivalente Metabólico)
    "average_met_minutes": "💪 MET minutos promedio. 1 MET = metabolismo en reposo. Rango: 1.0-15.0. ⭐⭐⭐",
    "high_activity_met_minutes": "🏃 MET minutos en actividad intensa. Rango: 0-500 MET·min. ⭐⭐⭐⭐",
    "medium_activity_met_minutes": "🚶‍♂️ MET minutos en actividad moderada. Rango: 0-800 MET·min. ⭐⭐⭐",
    "low_activity_met_minutes": "🚶 MET minutos en actividad ligera. Rango: 0-1200 MET·min. ⭐⭐",
    "sedentary_met_minutes": "💺 MET minutos sedentarios. Mayor valor = más tiempo inactivo. ⚠️",
    
    # Contributors de Readiness
    "activity_balance": "⚖️ Balance de actividad (contributor). Rango: 0-100. Equilibrio ejercicio/descanso. ⭐⭐⭐⭐",
    "body_temperature_contributor": "🌡️ Temperatura corporal (contributor). Rango: 0-100. Afecta readiness. ⭐⭐⭐⭐",
    "hrv_balance": "❤️ Balance HRV (contributor). Rango: 0-100. Variabilidad del ritmo cardíaco. ⭐⭐⭐⭐⭐",
    "previous_day_activity": "📅 Actividad del día anterior (contributor). Rango: 0-100. Recuperación del ejercicio. ⭐⭐⭐",
    "previous_night": "🌙 Noche anterior (contributor). Rango: 0-100. Calidad del sueño previo. ⭐⭐⭐⭐⭐",
    "recovery_index": "🔄 Índice de recuperación (contributor). Rango: 0-100. Capacidad de recuperación. ⭐⭐⭐⭐",
    "resting_heart_rate_contributor": "❤️ FC en reposo (contributor). Rango: 0-100. Menor FC = mejor contributor. ⭐⭐⭐⭐",
    "sleep_balance": "😴 Balance de sueño (contributor). Rango: 0-100. Suficiencia de horas de sueño. ⭐⭐⭐⭐⭐",
    "sleep_regularity": "📊 Regularidad de sueño (contributor). Rango: 0-100. Consistencia de horarios. ⭐⭐⭐",
    
    # Otros
    "day_summary": "📝 Resumen del día. Valores: optimal/good/fair/pay_attention. Categorización general. ⭐⭐⭐",
    "sleep_type": "🛏️ Tipo de sueño. Valores: long_sleep/sleep/late_nap/rest. Clasifica sesión principal. ⭐⭐",
    "restless_periods": "😰 Períodos inquietos durante el sueño. Rango: 0-20. Menor es mejor. ⭐⭐⭐",
    "inactivity_alerts": "⚠️ Alertas de inactividad recibidas. Rango: 0-10. App sugiere moverse. ⭐⭐",
}

def complete_missing_descriptions():
    """Completa solo las descripciones faltantes, manteniendo las existentes"""
    
    client = bigquery.Client(project=PROJECT_ID)
    table_ref = client.dataset(DATASET_ID).table(TABLE_ID)
    table = client.get_table(table_ref)
    
    print("📝 Completando descripciones faltantes en daily_biometrics_v2...")
    print("")
    
    new_schema = []
    added_count = 0
    skipped_count = 0
    
    for field in table.schema:
        # Si ya tiene descripción, mantenerla
        if field.description:
            new_schema.append(field)
            skipped_count += 1
            continue
        
        # Si está en nuestro diccionario, agregarla
        if field.name in MISSING_DESCRIPTIONS:
            description = MISSING_DESCRIPTIONS[field.name]
            new_field = bigquery.SchemaField(
                name=field.name,
                field_type=field.field_type,
                mode=field.mode,
                description=description,
                fields=field.fields
            )
            new_schema.append(new_field)
            added_count += 1
            print(f"  ✅ {field.name}")
            print(f"     {description[:70]}...")
        else:
            # No está en el diccionario, dejar sin descripción
            new_schema.append(field)
            print(f"  ⚠️  {field.name} - no encontrada en diccionario")
    
    print("")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"📊 RESUMEN:")
    print(f"   • Descripciones agregadas: {added_count}")
    print(f"   • Descripciones mantenidas: {skipped_count}")
    print(f"   • Total columnas: {len(new_schema)}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    # Confirmar antes de actualizar
    print("")
    response = input("¿Actualizar tabla en BigQuery? (y/n): ")
    
    if response.lower() == 'y':
        table.schema = new_schema
        table = client.update_table(table, ["schema"])
        print("")
        print("✅ Tabla actualizada exitosamente!")
        print("")
        print(f"Ver en BigQuery Console:")
        print(f"https://console.cloud.google.com/bigquery?project={PROJECT_ID}&ws=!1m5!1m4!4m3!1s{PROJECT_ID}!2s{DATASET_ID}!3s{TABLE_ID}")
    else:
        print("")
        print("❌ Operación cancelada. No se hicieron cambios.")

if __name__ == "__main__":
    complete_missing_descriptions()
