export interface DailyMetrics {
  calendar_date: string;
  sleep_score: number | null;
  readiness_score: number | null;
  activity_score: number | null;
  total_sleep_seconds: number | null;
  deep_sleep_seconds: number | null;
  rem_sleep_seconds: number | null;
  steps: number | null;
  active_calories: number | null;
  lowest_heart_rate: number | null;
  average_heart_rate: number | null;
  temperature_deviation_celsius: number | null;
  resilience_level: string | null;
}
