-- Oura Health Agent - BigQuery Schema
-- Table: oura_biometrics.daily_biometrics_gold
-- Description: Consolidated daily health metrics from Oura Ring API

CREATE TABLE IF NOT EXISTS `last-240000.oura_biometrics.daily_biometrics_gold` (
  -- Date & Metadata
  calendar_date DATE NOT NULL,
  ingestion_timestamp TIMESTAMP NOT NULL,
  
  -- Scores (0-100)
  sleep_score INT64,
  readiness_score INT64,
  activity_score INT64,
  
  -- Resilience & Stress
  resilience_level STRING,  -- e.g., "normal", "low", "high"
  day_summary STRING,       -- e.g., "restored", "stressed"
  
  -- Sleep Duration (seconds)
  total_sleep_seconds INT64,
  rem_sleep_seconds INT64,
  deep_sleep_seconds INT64,
  light_sleep_seconds INT64,
  awake_time_seconds INT64,
  
  -- Sleep Quality
  sleep_efficiency_pct FLOAT64,  -- 0-100
  sleep_latency_seconds INT64,   -- Time to fall asleep
  
  -- Sleep Timing
  bed_time_start TIME,      -- HH:MM:SS
  bed_time_end TIME,        -- HH:MM:SS
  
  -- Heart & Respiratory
  average_heart_rate FLOAT64,  -- bpm
  lowest_heart_rate FLOAT64,   -- bpm
  respiratory_rate_bpm FLOAT64,
  temperature_deviation_celsius FLOAT64,  -- Deviation from baseline
  
  -- Activity
  steps INT64,
  active_calories INT64,
  total_calories INT64,
  sedentary_time_seconds INT64,
  equivalent_walking_distance_meters INT64
)
PARTITION BY calendar_date
CLUSTER BY calendar_date
OPTIONS(
  description="Daily consolidated health metrics from Oura Ring API v2",
  labels=[("source", "oura-api"), ("version", "v17-lite")]
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_calendar_date
ON `last-240000.oura_biometrics.daily_biometrics_gold` (calendar_date DESC);

-- Sample query: Last 7 days
-- SELECT 
--   calendar_date,
--   sleep_score,
--   readiness_score,
--   activity_score,
--   steps,
--   total_sleep_seconds / 3600.0 AS sleep_hours
-- FROM `last-240000.oura_biometrics.daily_biometrics_gold`
-- WHERE calendar_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
-- ORDER BY calendar_date DESC;
