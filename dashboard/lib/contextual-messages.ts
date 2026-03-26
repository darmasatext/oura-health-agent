/**
 * Generadores de mensajes contextuales y positivos
 * Para dar retroalimentación amigable a adultos mayores
 */

/**
 * Mensaje contextual para calidad de sueño
 */
export function getSleepMessage(score: number, userName: string = ''): string {
  const greeting = userName ? `, ${userName}` : "";
  if (score >= 85) {
    return `¡Vas muy bien hoy${greeting}! Dormiste excelente.`;
  } else if (score >= 70) {
    return `Tu sueño fue bueno, ${userName}. Sigue así.`;
  } else if (score >= 60) {
    return `Dormiste regular, ${userName}. Intenta acostarte 30 minutos antes mañana.`;
  } else {
    return `Tu sueño estuvo bajo, ${userName}. Descansa esta noche y evita el café después de las 4 PM.`;
  }
}

/**
 * Mensaje contextual para nivel de recuperación
 */
export function getReadinessMessage(score: number): string {
  if (score >= 85) {
    return 'Tu cuerpo está listo para un gran día. ¡Aprovecha tu energía!';
  } else if (score >= 70) {
    return 'Tienes buena energía hoy. Haz actividades moderadas.';
  } else if (score >= 60) {
    return 'Tu cuerpo necesita descansar un poco. Tómalo con calma.';
  } else {
    return 'Tu cuerpo está cansado. Descansa 10 minutos cada hora.';
  }
}

/**
 * Mensaje contextual para actividad física
 */
export function getActivityMessage(steps: number, goal: number = 8000): string {
  const percentage = (steps / goal) * 100;
  
  if (steps >= goal) {
    return `¡Excelente! Ya superaste tu meta de ${goal.toLocaleString('es-MX')} pasos.`;
  } else if (percentage >= 75) {
    return `Muy bien, llevas ${steps.toLocaleString('es-MX')} pasos. Te faltan ${(goal - steps).toLocaleString('es-MX')} para tu meta.`;
  } else if (percentage >= 50) {
    return `Vas bien, pero intenta caminar un poco más. Te faltan ${(goal - steps).toLocaleString('es-MX')} pasos.`;
  } else {
    return `Intenta dar una caminata de 15 minutos. Tu cuerpo te lo agradecerá.`;
  }
}

/**
 * Mensaje para variabilidad del ritmo cardíaco (HRV)
 */
export function getHRVMessage(hrv: number): string {
  if (hrv >= 60) {
    return 'Tu corazón está muy flexible - señal de excelente recuperación.';
  } else if (hrv >= 40) {
    return 'Tu corazón tiene buena flexibilidad - estás recuperándote bien.';
  } else if (hrv >= 20) {
    return 'Tu corazón está un poco rígido. Descansa más hoy.';
  } else {
    return 'Tu corazón necesita descanso. Evita ejercicio intenso hoy.';
  }
}

/**
 * Mensaje para frecuencia cardíaca en reposo
 */
export function getRestingHRMessage(hr: number): string {
  if (hr <= 55) {
    return 'Excelente - tu corazón late despacio cuando descansas. Eso es muy bueno.';
  } else if (hr <= 65) {
    return 'Muy bien - tu corazón late tranquilo cuando descansas.';
  } else if (hr <= 75) {
    return 'Normal - tu corazón está en un rango saludable.';
  } else {
    return 'Un poco alto. Intenta respirar profundo 5 minutos al día.';
  }
}

/**
 * Mensaje para temperatura corporal
 */
export function getTemperatureMessage(deviation: number): string {
  if (Math.abs(deviation) <= 0.2) {
    return 'Tu temperatura está perfecta - sin cambios.';
  } else if (deviation > 0.2 && deviation <= 0.5) {
    return 'Tu temperatura subió un poco. Normal si hiciste ejercicio o hace calor.';
  } else if (deviation > 0.5) {
    return 'Tu temperatura está alta. Descansa y toma agua. Si persiste, consulta al doctor.';
  } else if (deviation < -0.2 && deviation >= -0.5) {
    return 'Tu temperatura bajó un poco. Normal si hace frío.';
  } else {
    return 'Tu temperatura está baja. Abrígate y toma líquidos calientes.';
  }
}

/**
 * Mensaje de contexto para rangos normales
 */
export function getRangeContext(
  metric: string,
  value: number,
  min: number,
  max: number
): string {
  return `Rango normal: ${min}-${max} ${metric}`;
}

/**
 * Mensaje de progreso semanal
 */
export function getWeeklyProgressMessage(
  current: number,
  previous: number,
  unit: string = 'puntos'
): string {
  const diff = current - previous;
  const percentChange = ((diff / previous) * 100).toFixed(0);
  
  if (diff > 0) {
    return `¡Mejoraste! Subiste ${Math.abs(diff)} ${unit} (${percentChange}%) vs la semana pasada.`;
  } else if (diff < 0) {
    return `Bajaste ${Math.abs(diff)} ${unit} (${percentChange}%) vs la semana pasada. No te preocupes, es normal.`;
  } else {
    return `Igual que la semana pasada. Muy estable.`;
  }
}
