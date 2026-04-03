#!/usr/bin/env python3
"""
Script para completar las descripciones faltantes en daily_biometrics_v2
Solo actualiza las columnas que quedaron sin descripción
"""

from google.cloud import bigquery

PROJECT_ID = "last-240000"

# Descripciones para las columnas faltantes
MISSING_DESCRIPTIONS = {
    "day_summary": "📝 Resumen del día. Valores: optimal/good/fair/pay_attention. Categorización general. ⭐⭐⭐",
    "activity_balance": "⚖️ Balance de actividad (contributor). Rango: 0-100. Equilibrio ejercicio/descanso. ⭐⭐⭐⭐",
    "body_temperature_contributor": "🌡️ Temperatura corporal (contributor). Rango: 0-100. Afecta readiness. ⭐⭐⭐⭐",
    "hrv_balance": "❤️ Balance HRV (contributor). Rango: 0-100. Variabilidad del ritmo cardíaco. ⭐⭐⭐⭐⭐",
    "previous_day_activity": "📅 Actividad del día anterior (contributor). Rango: 0-100. Recuperación del ejercicio. ⭐⭐⭐",
    "previous_night": "🌙 Noche anterior (contributor). Rango: 0-100. Calidad del sueño previo. ⭐⭐⭐⭐⭐",
    "recovery_index": "🔄 Índice de recuperación (contributor). Rango: 0-100. Capacidad de recuperación. ⭐⭐⭐⭐",
    "resting_heart_rate_contributor": "❤️ FC en reposo (contributor). Rango: 0-100. Menor FC = mejor contributor. ⭐⭐⭐⭐",
    "sleep_balance": "😴 Balance de sueño (contributor). Rango: 0-100. Suficiencia de horas de sueño. ⭐⭐⭐⭐⭐",
    "sleep_regularity": "📊 Regularidad de sueño (contributor). Rango: 0-100. Consistencia de horarios. ⭐⭐⭐",
    "high_activity_hours": "💪 Horas en actividad intensa (decimal). Rango: 0-6h/día. ⭐⭐⭐⭐",
    "medium_activity_hours": "🚶‍♂️ Horas en actividad moderada (decimal). Rango: 0-12h/día. ⭐⭐⭐",
    "low_activity_hours": "🚶 Horas en actividad ligera (decimal). Rango: 0-18h/día. ⭐⭐",
    "resting_hours": "🧘 Horas en reposo consciente (decimal). Meditación, lectura, etc. ⭐⭐⭐",
    "non_wear_hours": "⌚ Horas sin llevar el anillo (decimal). Afecta precisión de datos. ⚠️",
    "average_met_minutes": "💪 MET minutos promedio. 1 MET = metabolismo en reposo. Rango: 1.0-15.0. ⭐⭐⭐",
    "high_activity_met_minutes": "🏃 MET minutos en actividad intensa. Rango: 0-500 MET·min. ⭐⭐⭐⭐",
    "medium_activity_met_minutes": "🚶‍♂️ MET minutos en actividad moderada. Rango: 0-800 MET·min. ⭐⭐⭐",
    "low_activity_met_minutes": "🚶 MET minutos en actividad ligera. Rango: 0-1200 MET·min. ⭐⭐",
    "sedentary_met_minutes": "💺 MET minutos sedentarios. Mayor valor = más tiempo inactivo. ⚠️",
}

def main():
    client = bigquery.Client(project=PROJECT_ID)
    
    print("=" * 70)
    print("🔧 COMPLETANDO DESCRIPCIONES FALTANTES EN daily_biometrics_v2")
    print("=" * 70)
    print("")
    
    # Obtener tabla
    table_ref = client.dataset("oura_biometrics").table("daily_biometrics_v2")
    table = client.get_table(table_ref)
    
    # Actualizar schema
    new_schema = []
    updated_count = 0
    
    for field in table.schema:
        # Si la columna está en nuestro diccionario y no tiene descripción
        if field.name in MISSING_DESCRIPTIONS and not field.description:
            description = MISSING_DESCRIPTIONS[field.name]
            new_field = bigquery.SchemaField(
                name=field.name,
                field_type=field.field_type,
                mode=field.mode,
                description=description,
                fields=field.fields
            )
            new_schema.append(new_field)
            updated_count += 1
            print(f"  ✅ {field.name}")
            print(f"     {description[:70]}...")
        else:
            # Mantener el campo como está
            new_schema.append(field)
    
    # Actualizar tabla
    table.schema = new_schema
    table = client.update_table(table, ["schema"])
    
    print("")
    print("=" * 70)
    print(f"✅ ACTUALIZACIÓN COMPLETADA")
    print("=" * 70)
    print(f"Columnas actualizadas: {updated_count}")
    print("")
    print("🔗 Verifica en BigQuery Console:")
    print(f"https://console.cloud.google.com/bigquery?project={PROJECT_ID}&ws=!1m5!1m4!4m3!1s{PROJECT_ID}!2soura_biometrics!3sdaily_biometrics_v2")

if __name__ == "__main__":
    main()
