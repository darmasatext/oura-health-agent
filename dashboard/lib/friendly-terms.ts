/**
 * Diccionario de términos técnicos → Lenguaje simple
 * Para hacer el dashboard comprensible para adultos mayores
 */

export const FRIENDLY_TERMS: Record<string, string> = {
  // Métricas de sueño
  'HRV': 'Calidad de tu descanso',
  'Variabilidad de la Frecuencia Cardíaca': 'Nivel de energía',
  'Readiness Score': 'Qué tan listo está tu cuerpo',
  'Sleep Score': 'Calidad de sueño',
  'Activity Score': 'Qué tan activo estuviste',
  'Sleep Latency': 'Tiempo para dormirte',
  'Sleep efficiency': 'Qué tan bien dormiste',
  'Sleep Efficiency': 'Qué tan bien dormiste',
  'Deep sleep': 'Sueño profundo',
  'Deep Sleep': 'Sueño profundo',
  'REM sleep': 'Sueño de sueños',
  'REM Sleep': 'Sueño de sueños',
  'Light sleep': 'Sueño ligero',
  'Light Sleep': 'Sueño ligero',
  'Total sleep': 'Horas totales de sueño',
  'Total Sleep': 'Horas totales de sueño',
  
  // Métricas de recuperación
  'Readiness': 'Nivel de recuperación',
  'Recovery index': 'Índice de recuperación',
  'Recovery Index': 'Índice de recuperación',
  'Resilience': 'Capacidad de aguante',
  'Heart Rate Variability': 'Variabilidad del ritmo cardíaco',
  'Resting heart rate': 'Latidos cuando descansas',
  'Resting Heart Rate': 'Latidos cuando descansas',
  'HR': 'Frecuencia cardíaca',
  'BPM': 'Latidos por minuto',
  
  // Métricas de actividad
  'Activity': 'Actividad física',
  'Steps': 'Pasos',
  'Active calories': 'Calorías quemadas en actividad',
  'Active Calories': 'Calorías quemadas en actividad',
  'Sedentary time': 'Tiempo sentado',
  'Sedentary Time': 'Tiempo sentado',
  'MET minutes': 'Minutos de ejercicio',
  'MET Minutes': 'Minutos de ejercicio',
  'MET': 'Equivalente metabólico',
  
  // Otras métricas
  'Temperature deviation': 'Cambio de temperatura',
  'Temperature Deviation': 'Cambio de temperatura',
  'Body temperature': 'Temperatura corporal',
  'Body Temperature': 'Temperatura corporal',
  'Respiratory rate': 'Ritmo respiratorio',
  'Respiratory Rate': 'Ritmo respiratorio',
  'SpO2': 'Nivel de oxígeno',
  'VO2': 'Capacidad aeróbica',
};

/**
 * Traduce un término técnico a lenguaje simple
 * @param technical - Término técnico
 * @returns Término simple o el original si no hay traducción
 */
export function translateTerm(technical: string): string {
  return FRIENDLY_TERMS[technical] || technical;
}

/**
 * Traduce múltiples términos en un texto
 * @param text - Texto con términos técnicos
 * @returns Texto con términos traducidos
 */
export function translateText(text: string): string {
  let result = text;
  Object.entries(FRIENDLY_TERMS).forEach(([technical, simple]) => {
    const regex = new RegExp(technical, 'g');
    result = result.replace(regex, simple);
  });
  return result;
}
