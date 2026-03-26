export const helpContent = {
  sleepScore: {
    short: "Calidad general del sueño basado en duración, profundidad y continuidad.",
    long: (
      <>
        <h2>Calidad de Sueño</h2>
        <p>Esta métrica combina varios factores:</p>
        <ul>
          <li><strong>Duración:</strong> Horas totales dormidas</li>
          <li><strong>Profundidad:</strong> Proporción de sueño profundo y REM</li>
          <li><strong>Continuidad:</strong> Qué tan seguido dormiste</li>
        </ul>
        <h3>Rangos:</h3>
        <ul>
          <li>85-100: Excelente</li>
          <li>70-84: Bueno</li>
          <li>55-69: Regular</li>
          <li>&lt;55: Necesita mejora</li>
        </ul>
        <h3>Tips para mejorar:</h3>
        <ul>
          <li>Mantén horarios consistentes</li>
          <li>Evita pantallas 1 hora antes de dormir</li>
          <li>Mantén el cuarto fresco (18-20°C)</li>
          <li>Evita cafeína después de las 2 PM</li>
        </ul>
      </>
    )
  },
  
  readinessScore: {
    short: "Qué tan listo está tu cuerpo para actividad física.",
    long: (
      <>
        <h2>Nivel de Recuperación</h2>
        <p>Combina múltiples señales:</p>
        <ul>
          <li><strong>Sueño de anoche:</strong> Calidad y duración</li>
          <li><strong>Frecuencia cardíaca:</strong> Más baja = mejor recuperación</li>
          <li><strong>HRV:</strong> Variabilidad del ritmo cardíaco</li>
          <li><strong>Temperatura:</strong> Desviación de tu baseline</li>
        </ul>
        <h3>Cuándo entrenar:</h3>
        <ul>
          <li>&gt;85: Entrenamiento completo</li>
          <li>70-84: Entrenamiento moderado</li>
          <li>&lt;70: Descanso activo o día off</li>
        </ul>
      </>
    )
  },
  
  hrv: {
    short: "Variabilidad del ritmo cardíaco. Más alto = mejor recuperación.",
    long: (
      <>
        <h2>HRV (Variabilidad del Ritmo Cardíaco)</h2>
        <p>Mide la variación de tiempo entre latidos. Es un indicador de:</p>
        <ul>
          <li><strong>Estrés:</strong> Bajo HRV = más estrés</li>
          <li><strong>Recuperación:</strong> Alto HRV = cuerpo recuperado</li>
          <li><strong>Adaptación:</strong> Respuesta al entrenamiento</li>
        </ul>
        <p><strong>Tu baseline es personal.</strong> No compares con otros.</p>
        <h3>Factores que bajan HRV:</h3>
        <ul>
          <li>Alcohol</li>
          <li>Falta de sueño</li>
          <li>Sobreentrenamiento</li>
          <li>Enfermedad</li>
        </ul>
      </>
    )
  },
  
  steps: {
    short: "Pasos totales detectados por el Oura Ring.",
    long: (
      <>
        <h2>Pasos Diarios</h2>
        <p>El Oura Ring detecta pasos usando acelerómetro.</p>
        <h3>Metas típicas:</h3>
        <ul>
          <li>Sedentario: 5,000 pasos</li>
          <li>Moderado: 7,500 pasos</li>
          <li>Activo: 10,000 pasos</li>
          <li>Muy activo: 12,500+ pasos</li>
        </ul>
        <p><strong>Nota:</strong> El anillo es menos preciso que un reloj para pasos, pero excelente para métricas de sueño y recuperación.</p>
      </>
    )
  },

  totalSleep: {
    short: "Horas totales de sueño durante la noche.",
    long: (
      <>
        <h2>Duración de Sueño</h2>
        <p>Tiempo total que pasaste dormido, excluyendo tiempo despierto en la cama.</p>
        <h3>Recomendaciones:</h3>
        <ul>
          <li>Adultos: 7-9 horas</li>
          <li>Mayores de 65: 7-8 horas</li>
        </ul>
        <p>La calidad importa tanto como la cantidad. 7 horas de sueño profundo valen más que 9 horas de sueño interrumpido.</p>
      </>
    )
  },

  deepSleep: {
    short: "Sueño profundo - fase donde tu cuerpo se repara físicamente.",
    long: (
      <>
        <h2>Sueño Profundo</h2>
        <p>Esta es la fase más reparadora del sueño. Aquí:</p>
        <ul>
          <li>Se reparan músculos y tejidos</li>
          <li>Se fortalece el sistema inmune</li>
          <li>Se consolida memoria de largo plazo</li>
        </ul>
        <h3>Duración ideal:</h3>
        <ul>
          <li>Adultos: 1-2 horas por noche (15-25% del sueño total)</li>
        </ul>
        <h3>Cómo mejorarla:</h3>
        <ul>
          <li>Ejercicio regular (pero no antes de dormir)</li>
          <li>Cuarto fresco y oscuro</li>
          <li>Evita alcohol (interrumpe sueño profundo)</li>
        </ul>
      </>
    )
  },

  remSleep: {
    short: "Sueño de sueños - fase donde procesas emociones y aprendes.",
    long: (
      <>
        <h2>Sueño REM (Fase de Sueños)</h2>
        <p>En esta fase:</p>
        <ul>
          <li>Sueñas más vívidamente</li>
          <li>Procesas emociones del día</li>
          <li>Consolidas aprendizaje y creatividad</li>
        </ul>
        <h3>Duración ideal:</h3>
        <ul>
          <li>Adultos: 90-120 minutos por noche (20-25% del sueño total)</li>
        </ul>
        <h3>Qué lo afecta:</h3>
        <ul>
          <li>Alcohol (lo reduce drásticamente)</li>
          <li>Algunos medicamentos</li>
          <li>Estrés y ansiedad</li>
        </ul>
      </>
    )
  },

  restingHeartRate: {
    short: "Latidos por minuto cuando estás en reposo completo.",
    long: (
      <>
        <h2>Frecuencia Cardíaca en Reposo</h2>
        <p>Oura mide tu FC mientras duermes, cuando estás más relajado.</p>
        <h3>Rangos normales:</h3>
        <ul>
          <li>Excelente: 40-60 bpm</li>
          <li>Bueno: 60-70 bpm</li>
          <li>Promedio: 70-80 bpm</li>
        </ul>
        <p><strong>Tendencias importan más que valores absolutos.</strong> Un aumento de 5+ bpm puede indicar:</p>
        <ul>
          <li>Sobreentrenamiento</li>
          <li>Inicio de enfermedad</li>
          <li>Estrés o mala recuperación</li>
        </ul>
      </>
    )
  },

  activityScore: {
    short: "Nivel de actividad física basado en movimiento y ejercicio.",
    long: (
      <>
        <h2>Nivel de Actividad</h2>
        <p>Combina:</p>
        <ul>
          <li>Pasos totales</li>
          <li>Calorías quemadas en actividad</li>
          <li>Tiempo de inactividad vs actividad</li>
          <li>Cumplimiento de metas diarias</li>
        </ul>
        <h3>Metas:</h3>
        <ul>
          <li>Muévete cada hora</li>
          <li>Cumple meta de pasos</li>
          <li>Balancea días activos con recuperación</li>
        </ul>
      </>
    )
  },

  temperature: {
    short: "Desviación de tu temperatura corporal normal.",
    long: (
      <>
        <h2>Temperatura Corporal</h2>
        <p>Oura mide tu temperatura relativa (no absoluta) para detectar cambios.</p>
        <h3>Qué significan las variaciones:</h3>
        <ul>
          <li><strong>+0.5°C o más:</strong> Posible inicio de enfermedad, ovulación, o alcohol</li>
          <li><strong>Baseline (0°):</strong> Normal para ti</li>
          <li><strong>-0.5°C o menos:</strong> Buena recuperación o adaptación al frío</li>
        </ul>
        <p>Tu baseline se calcula durante las primeras semanas de uso.</p>
      </>
    )
  },

  respiratoryRate: {
    short: "Respiraciones por minuto mientras duermes.",
    long: (
      <>
        <h2>Ritmo Respiratorio</h2>
        <p>Medido durante el sueño.</p>
        <h3>Rangos normales:</h3>
        <ul>
          <li>Adultos: 12-20 respiraciones por minuto</li>
        </ul>
        <h3>Cambios pueden indicar:</h3>
        <ul>
          <li>Inicio de enfermedad respiratoria</li>
          <li>Altitud elevada</li>
          <li>Estrés o ansiedad</li>
        </ul>
      </>
    )
  },

  navigation: {
    long: (
      <>
        <h2>Navegación</h2>
        <ul>
          <li><strong>Dashboard:</strong> Resumen de últimos 7 días con métricas principales</li>
          <li><strong>Sueño:</strong> Análisis detallado de calidad, duración y fases de sueño</li>
          <li><strong>Recuperación:</strong> Estado de recuperación, HRV y preparación física</li>
          <li><strong>Actividad:</strong> Pasos, calorías y movimiento diario</li>
          <li><strong>Análisis:</strong> Patrones, tendencias y descubrimientos personalizados</li>
          <li><strong>Comparar:</strong> Compara semanas o períodos personalizados</li>
        </ul>
        <h2>Tips de Uso</h2>
        <ul>
          <li>Busca el icono <strong>?</strong> para ayuda contextual</li>
          <li>Haz clic en métricas para ver detalles</li>
          <li>Navega con teclado usando Tab y Enter</li>
        </ul>
        <h2>Contacto</h2>
        <p>¿Dudas o problemas? Contacta a soporte técnico.</p>
      </>
    )
  }
};
