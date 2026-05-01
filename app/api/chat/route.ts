import { NextRequest, NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";

// ── BigQuery client ───────────────────────────────────────────
function getBQClient() {
  const credJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credJson) {
    let creds;
    try {
      // Intentar base64 primero (formato Vercel/producción)
      creds = JSON.parse(Buffer.from(credJson, 'base64').toString('utf-8'));
    } catch {
      // Fallback: JSON plano (desarrollo local)
      creds = JSON.parse(credJson);
    }
    return new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || "last-240000",
      credentials: creds,
    });
  }
  return new BigQuery({ projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || "last-240000" });
}

// ── Detecta de qué usuario trata la pregunta ─────────────────
function detectUser(message: string): "amparo" | "fer" | "both" {
  const lower = message.toLowerCase();
  if (lower.includes("amparo")) return "amparo";
  if (lower.includes("fer") || lower.includes("fernando")) return "fer";
  return "both";
}

// ── Fetch completo del datalake ───────────────────────────────
async function fetchHealthContext(user: "amparo" | "fer" | "both") {
  const bq = getBQClient();
  const project = process.env.GOOGLE_CLOUD_PROJECT_ID || "last-240000";
  const users = user === "both" ? ["amparo", "fer"] : [user];
  const context: Record<string, object> = {};

  for (const u of users) {
    try {
      const userData: Record<string, object> = {};

      const [allDays] = await bq.query(`
        SELECT calendar_date, activity_score, sleep_score, readiness_score,
               average_hrv_ms, steps, total_calories, resting_heart_rate_bpm,
               ROUND(total_sleep_seconds/3600, 2) AS sleep_hours,
               ROUND(deep_sleep_seconds/60, 1) AS deep_sleep_min,
               ROUND(rem_sleep_seconds/60, 1) AS rem_sleep_min,
               ROUND(light_sleep_seconds/60, 1) AS light_sleep_min,
               sleep_efficiency_pct, temperature_deviation_celsius,
               average_heart_rate, lowest_heart_rate_bpm,
               day_summary, resilience_level, stress_high_duration_seconds
        FROM \`${project}.oura_biometrics.daily_biometrics_${u}\`
        ORDER BY calendar_date DESC
        LIMIT 90
      `);
      userData.historial_completo = allDays;

      const [globalSummary] = await bq.query(`
        SELECT
          COUNT(*) AS total_dias,
          MIN(calendar_date) AS primer_registro, MAX(calendar_date) AS ultimo_registro,
          ROUND(AVG(sleep_score), 1) AS avg_sleep,
          ROUND(AVG(activity_score), 1) AS avg_activity,
          ROUND(AVG(readiness_score), 1) AS avg_readiness,
          ROUND(AVG(average_hrv_ms), 1) AS avg_hrv,
          ROUND(AVG(steps), 0) AS avg_steps,
          ROUND(AVG(resting_heart_rate_bpm), 1) AS avg_resting_hr,
          ROUND(AVG(total_sleep_seconds/3600), 2) AS avg_sleep_hours,
          MAX(sleep_score) AS mejor_sleep, MIN(sleep_score) AS peor_sleep,
          MAX(steps) AS max_steps
        FROM \`${project}.oura_biometrics.daily_biometrics_${u}\`
      `);
      userData.resumen_global = globalSummary[0] || {};

      const [monthly] = await bq.query(`
        SELECT FORMAT_DATE('%Y-%m', calendar_date) AS mes, COUNT(*) AS dias,
               ROUND(AVG(sleep_score), 1) AS avg_sleep,
               ROUND(AVG(activity_score), 1) AS avg_activity,
               ROUND(AVG(readiness_score), 1) AS avg_readiness,
               ROUND(AVG(average_hrv_ms), 1) AS avg_hrv,
               ROUND(AVG(steps), 0) AS avg_steps
        FROM \`${project}.oura_biometrics.daily_biometrics_${u}\`
        GROUP BY mes ORDER BY mes DESC
      `);
      userData.resumen_mensual = monthly;

      const [bestWorst] = await bq.query(`
        (SELECT 'mejor_sueno' AS tipo, CAST(calendar_date AS STRING) AS fecha, sleep_score AS score
         FROM \`${project}.oura_biometrics.daily_biometrics_${u}\`
         WHERE sleep_score IS NOT NULL ORDER BY sleep_score DESC LIMIT 3)
        UNION ALL
        (SELECT 'peor_sueno', CAST(calendar_date AS STRING), sleep_score
         FROM \`${project}.oura_biometrics.daily_biometrics_${u}\`
         WHERE sleep_score IS NOT NULL ORDER BY sleep_score ASC LIMIT 3)
        UNION ALL
        (SELECT 'mas_activo', CAST(calendar_date AS STRING), steps
         FROM \`${project}.oura_biometrics.daily_biometrics_${u}\`
         WHERE steps IS NOT NULL ORDER BY steps DESC LIMIT 3)
        UNION ALL
        (SELECT 'mayor_hrv', CAST(calendar_date AS STRING), CAST(average_hrv_ms AS INT64)
         FROM \`${project}.oura_biometrics.daily_biometrics_${u}\`
         WHERE average_hrv_ms IS NOT NULL ORDER BY average_hrv_ms DESC LIMIT 3)
      `);
      userData.dias_destacados = bestWorst;

      const [hrvTrend] = await bq.query(`
        SELECT calendar_date, average_hrv_ms, resting_heart_rate_bpm, readiness_score
        FROM \`${project}.oura_biometrics.daily_biometrics_${u}\`
        WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        ORDER BY calendar_date ASC
      `);
      userData.tendencia_hrv_30d = hrvTrend;

      try {
        const [sleep] = await bq.query(`SELECT * FROM \`${project}.oura_biometrics.sleep_sessions_${u}\` ORDER BY date DESC LIMIT 30`);
        if (sleep.length > 0) userData.sesiones_sueño = sleep;
      } catch { /* vacía */ }

      try {
        const [act] = await bq.query(`SELECT * FROM \`${project}.oura_biometrics.daily_activity_summary_${u}\` ORDER BY date DESC LIMIT 30`);
        if (act.length > 0) userData.resumen_actividad = act;
      } catch { /* vacía */ }

      context[u] = userData;
    } catch (e) {
      context[u] = { error: `No se pudieron obtener datos de ${u}: ${e}` };
    }
  }

  return context;
}

// ── Llama a Azure Anthropic directamente ─────────────────────
async function callOpenClaw(
  systemPrompt: string,
  history: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  const baseUrl = process.env.AZURE_ANTHROPIC_BASE_URL;
  const apiKey = process.env.AZURE_ANTHROPIC_API_KEY;
  const model = process.env.AZURE_ANTHROPIC_MODEL || 'claude-sonnet-4-6';

  if (!baseUrl || !apiKey) {
    throw new Error("AZURE_ANTHROPIC_BASE_URL o AZURE_ANTHROPIC_API_KEY no configurados");
  }

  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Azure Anthropic error ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "No pude generar una respuesta.";
}

// ── Handler principal ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ reply: "Por favor escribe una pregunta." });
    }

    const targetUser = detectUser(message);
    const healthData = await fetchHealthContext(targetUser);

    const systemPrompt = `Eres un asistente de salud amigable y empático que analiza datos biométricos del Oura Ring.
Tienes acceso al historial COMPLETO de datos de salud de Amparo y Fernando (Fer) desde BigQuery.

DATOS COMPLETOS DEL DATALAKE:
${JSON.stringify(healthData, null, 2)}

LENGUAJE (muy importante):
- NUNCA uses acrónimos. Escribe siempre la palabra completa:
  • HRV → "variabilidad de la frecuencia cardíaca" (primera vez) o "variabilidad cardíaca" (después)
  • FC → "frecuencia cardíaca"
  • REM → "sueño REM" o "fase de sueño de movimiento ocular rápido" (solo si necesitas explicar)
  • BPM → "latidos por minuto"
  • ETL, API, etc. → no los menciones al usuario
- Usa lenguaje cotidiano, como si le hablaras a alguien sin conocimientos médicos
- Explica qué significa cada dato cuando sea relevante (ej: "variabilidad cardíaca alta significa que tu cuerpo se recuperó bien")

INSTRUCCIONES DE CONTENIDO:
- Responde en español de México, de forma clara y conversacional
- Usa los datos para responder con precisión y profundidad
- Si un dato es NULL: "El anillo no midió eso esa noche"
- Incluye tendencias, comparaciones históricas y recomendaciones cuando aplique
- No inventes datos que no estén en el contexto
- Scores Oura: >85 excelente, 70-85 bueno, <70 necesita atención
- Variabilidad cardíaca alta = mejor recuperación; frecuencia cardíaca baja en reposo = mejor condición cardiovascular

FORMATO:
- Usa markdown simple: **negrita** para datos clave, listas con guión para múltiples items
- Para series de días, usa una tabla markdown (| col | col |)
- Evita encabezados ## grandes — el widget es pequeño; usa solo texto y **negrita**
- Respuestas concisas: máximo 8-10 líneas. Si hay tabla, omite párrafo largo
- Empieza directo con el dato, no con "¡Claro!" ni frases de relleno`;

    const reply = await callOpenClaw(systemPrompt, history, message);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Ocurrió un error al conectarme. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
