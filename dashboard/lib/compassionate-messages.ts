/**
 * Sistema de mensajes empáticos con tips accionables
 * Finding #39 del UX/CX Audit - Emotional Design
 */

export interface CompassionateMessage {
  message: string;
  tips: string[];
  tone: 'empathetic' | 'celebratory' | 'neutral';
  emoji: string;
}

/**
 * Genera mensaje empático basado en score y cambio
 * @param metric - Tipo de métrica (sleep, readiness, activity)
 * @param score - Score actual (0-100)
 * @param change - Cambio vs período anterior
 */
export function getCompassionateMessage(
  metric: 'sleep' | 'readiness' | 'activity',
  score: number,
  change: number
): CompassionateMessage {
  // Día muy malo (score <60)
  if (score < 60) {
    return {
      message: "Tuviste días difíciles. Recuerda que todos pasamos por esto. 💙",
      tips: [
        "Prioriza 8 horas de sueño esta noche",
        "Evita pantallas 1 hora antes de dormir",
        "Toma una caminata de 10 minutos al aire libre"
      ],
      tone: 'empathetic',
      emoji: '💙'
    };
  }
  
  // Día malo con bajón (score 60-70, change <-5)
  if (score >= 60 && score < 70 && change < -5) {
    return {
      message: "Bajó un poco, pero es temporal. Pequeños ajustes ayudan. 🌱",
      tips: [
        "Acuéstate 30 minutos más temprano hoy",
        "Evita cafeína después de las 3pm",
        "Haz 10 minutos de estiramiento antes de dormir"
      ],
      tone: 'empathetic',
      emoji: '🌱'
    };
  }
  
  // Día regular (score 70-80)
  if (score >= 70 && score < 80) {
    return {
      message: "Estás en un buen punto. Sigue así. 👍",
      tips: [
        "Mantén tu rutina de sueño",
        "Considera agregar 15 min de actividad ligera"
      ],
      tone: 'neutral',
      emoji: '👍'
    };
  }
  
  // Día bueno (score 80-85)
  if (score >= 80 && score < 85) {
    return {
      message: "¡Muy bien! Tu cuerpo está respondiendo genial. 😊",
      tips: [
        "Mantén esta consistencia",
        "Identifica qué hiciste diferente esta semana"
      ],
      tone: 'celebratory',
      emoji: '😊'
    };
  }
  
  // Día excelente (score >=85, change >5)
  if (score >= 85 && change > 5) {
    return {
      message: "¡Increíble! Estás en tu mejor momento. 🎉",
      tips: [
        "Documenta tu rutina actual",
        "Comparte tu éxito (si quieres motivar a alguien)"
      ],
      tone: 'celebratory',
      emoji: '🎉'
    };
  }
  
  // Día excelente sin cambio grande
  if (score >= 85) {
    return {
      message: "Excelente nivel. Sigue siendo consistente. ⭐",
      tips: [
        "Tu cuerpo está optimizado",
        "Mantén tus hábitos actuales"
      ],
      tone: 'celebratory',
      emoji: '⭐'
    };
  }
  
  // Default (score 70-80, sin cambio)
  return {
    message: "Todo normal. Vas bien. 👌",
    tips: [],
    tone: 'neutral',
    emoji: '👌'
  };
}
