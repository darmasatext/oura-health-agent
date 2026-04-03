'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface BenchmarkData {
  sleepQuality: string;
  totalHours: string;
  deepSleep: string;
  remSleep: string;
  spo2: string;
  notesKey?: string;
}

// Benchmarks por edad, género y condición de salud
const benchmarks: Record<string, Record<string, Record<string, BenchmarkData>>> = {
  '18-25': {
    male: {
      healthy: {
        sleepQuality: '75-85',
        totalHours: '7-9 horas',
        deepSleep: '84-120 min (20-25%)',
        remSleep: '90-120 min (20-25%)',
        spo2: '≥95%',
      },
      diabetes: {
        sleepQuality: '70-80',
        totalHours: '7.5-9 horas',
        deepSleep: '90-120 min (23-27%)',
        remSleep: '84-114 min (20-24%)',
        spo2: '≥95%',
        notesKey: 'sleep.note_diabetes_male_18_25',
      },
      cardiovascular: {
        sleepQuality: '70-80',
        totalHours: '7-8 horas',
        deepSleep: '90-126 min (22-28%)',
        remSleep: '84-108 min (18-23%)',
        spo2: '≥94%',
        notesKey: 'sleep.note_cardiovascular_male_18_25',
      },
    },
    female: {
      healthy: {
        sleepQuality: '75-85',
        totalHours: '7-9 horas',
        deepSleep: '90-126 min (22-28%)',
        remSleep: '90-120 min (20-25%)',
        spo2: '≥95%',
      },
      diabetes: {
        sleepQuality: '70-80',
        totalHours: '7.5-9 horas',
        deepSleep: '96-132 min (24-29%)',
        remSleep: '84-114 min (20-24%)',
        spo2: '≥95%',
        notesKey: 'sleep.note_diabetes_female_18_25',
      },
      cardiovascular: {
        sleepQuality: '70-80',
        totalHours: '7-8 horas',
        deepSleep: '96-132 min (23-29%)',
        remSleep: '84-108 min (18-23%)',
        spo2: '≥94%',
        notesKey: 'sleep.note_cardiovascular_female_18_25',
      },
    },
  },
  '26-40': {
    male: {
      healthy: {
        sleepQuality: '70-85',
        totalHours: '7-9 horas',
        deepSleep: '72-108 min (18-23%)',
        remSleep: '84-114 min (18-24%)',
        spo2: '≥95%',
      },
      diabetes: {
        sleepQuality: '68-80',
        totalHours: '7.5-9 horas',
        deepSleep: '84-114 min (20-25%)',
        remSleep: '78-108 min (17-23%)',
        spo2: '≥94%',
        notesKey: 'sleep.note_diabetes_male_26_40',
      },
      cardiovascular: {
        sleepQuality: '65-78',
        totalHours: '7-8 horas',
        deepSleep: '84-114 min (20-25%)',
        remSleep: '72-102 min (16-22%)',
        spo2: '≥94%',
        notesKey: 'sleep.note_cardiovascular_male_26_40',
      },
    },
    female: {
      healthy: {
        sleepQuality: '70-85',
        totalHours: '7-9 horas',
        deepSleep: '78-120 min (20-26%)',
        remSleep: '84-114 min (18-24%)',
        spo2: '≥95%',
      },
      diabetes: {
        sleepQuality: '68-80',
        totalHours: '7.5-9 horas',
        deepSleep: '84-126 min (21-27%)',
        remSleep: '78-108 min (17-23%)',
        spo2: '≥94%',
        notesKey: 'sleep.note_diabetes_female_26_40',
      },
      cardiovascular: {
        sleepQuality: '65-78',
        totalHours: '7-8 horas',
        deepSleep: '84-120 min (20-26%)',
        remSleep: '72-102 min (16-22%)',
        spo2: '≥94%',
        notesKey: 'sleep.note_cardiovascular_female_26_40',
      },
    },
  },
  '41-64': {
    male: {
      healthy: {
        sleepQuality: '65-80',
        totalHours: '7-9 horas',
        deepSleep: '60-96 min (15-20%)',
        remSleep: '72-102 min (15-21%)',
        spo2: '≥94%',
      },
      diabetes: {
        sleepQuality: '63-78',
        totalHours: '7.5-8.5 horas',
        deepSleep: '72-108 min (17-23%)',
        remSleep: '66-96 min (14-20%)',
        spo2: '≥93%',
        notesKey: 'sleep.note_diabetes_male_41_64',
      },
      cardiovascular: {
        sleepQuality: '60-75',
        totalHours: '7-8 horas',
        deepSleep: '72-108 min (18-24%)',
        remSleep: '66-96 min (14-20%)',
        spo2: '≥92%',
        notesKey: 'sleep.note_cardiovascular_male_41_64',
      },
    },
    female: {
      healthy: {
        sleepQuality: '65-80',
        totalHours: '7-9 horas',
        deepSleep: '66-108 min (17-23%)',
        remSleep: '72-102 min (15-21%)',
        spo2: '≥94%',
      },
      diabetes: {
        sleepQuality: '63-78',
        totalHours: '7.5-8.5 horas',
        deepSleep: '78-114 min (19-25%)',
        remSleep: '66-96 min (14-20%)',
        spo2: '≥93%',
        notesKey: 'sleep.note_diabetes_female_41_64',
      },
      cardiovascular: {
        sleepQuality: '60-75',
        totalHours: '7-8 horas',
        deepSleep: '78-114 min (19-25%)',
        remSleep: '66-96 min (14-20%)',
        spo2: '≥92%',
        notesKey: 'sleep.note_cardiovascular_female_41_64',
      },
    },
  },
  '65+': {
    male: {
      healthy: {
        sleepQuality: '60-75',
        totalHours: '7-8 horas',
        deepSleep: '48-84 min (12-18%)',
        remSleep: '60-90 min (13-19%)',
        spo2: '≥93%',
      },
      diabetes: {
        sleepQuality: '58-73',
        totalHours: '7.5-8 horas',
        deepSleep: '54-90 min (14-20%)',
        remSleep: '54-84 min (12-18%)',
        spo2: '≥92%',
        notesKey: 'sleep.note_diabetes_male_65',
      },
      cardiovascular: {
        sleepQuality: '55-70',
        totalHours: '7-8 horas',
        deepSleep: '60-96 min (15-21%)',
        remSleep: '54-84 min (12-18%)',
        spo2: '≥91%',
        notesKey: 'sleep.note_cardiovascular_male_65',
      },
    },
    female: {
      healthy: {
        sleepQuality: '60-75',
        totalHours: '7-8 horas',
        deepSleep: '54-90 min (14-20%)',
        remSleep: '60-90 min (13-19%)',
        spo2: '≥93%',
      },
      diabetes: {
        sleepQuality: '58-73',
        totalHours: '7.5-8 horas',
        deepSleep: '60-96 min (15-21%)',
        remSleep: '54-84 min (12-18%)',
        spo2: '≥92%',
        notesKey: 'sleep.note_diabetes_female_65',
      },
      cardiovascular: {
        sleepQuality: '55-70',
        totalHours: '7-8 horas',
        deepSleep: '60-96 min (15-21%)',
        remSleep: '54-84 min (12-18%)',
        spo2: '≥91%',
        notesKey: 'sleep.note_cardiovascular_female_65',
      },
    },
  },
};

export function SleepBenchmark() {
  const { t } = useLanguage();
  const [ageRange, setAgeRange] = useState<string>('26-40');
  const [gender, setGender] = useState<string>('male');
  const [condition, setCondition] = useState<string>('healthy');
  
  const benchmark = benchmarks[ageRange]?.[gender]?.[condition];

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3 mb-4">
        <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">{t('sleep.benchmark_title')}</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            {t('sleep.benchmark_subtitle')}
          </p>
        </div>
      </div>

      {/* Selectores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('sleep.age_label')}
          </label>
          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base font-medium focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="18-25">{t('sleep.age_18_25')}</option>
            <option value="26-40">{t('sleep.age_26_40')}</option>
            <option value="41-64">{t('sleep.age_41_64')}</option>
            <option value="65+">{t('sleep.age_65_plus')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('sleep.gender_label')}
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base font-medium focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="male">{t('sleep.male')}</option>
            <option value="female">{t('sleep.female')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('sleep.condition_label')}
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base font-medium focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="healthy">{t('sleep.healthy')}</option>
            <option value="diabetes">{t('sleep.diabetes')}</option>
            <option value="cardiovascular">{t('sleep.cardiovascular')}</option>
          </select>
        </div>
      </div>

      {/* Benchmarks */}
      {benchmark && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-100 dark:border-blue-900">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">{t('sleep.optimal_quality')}</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{benchmark.sleepQuality}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('sleep.optimal_score')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-100 dark:border-blue-900">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">{t('sleep.total_hours_benchmark')}</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{benchmark.totalHours}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('sleep.per_night')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-100 dark:border-red-900">
              <h4 className="font-bold text-red-900 dark:text-red-300 mb-2">{t('sleep.oxygenation')}</h4>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{benchmark.spo2}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('sleep.oxygen_saturation')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-100 dark:border-purple-900">
              <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2">{t('sleep.deep_sleep_benchmark')}</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{benchmark.deepSleep}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('sleep.of_total')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-100 dark:border-purple-900">
              <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2">{t('sleep.rem_sleep_benchmark')}</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{benchmark.remSleep}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('sleep.of_total')}</p>
            </div>
          </div>

          {/* Notas específicas por condición */}
          {benchmark.notesKey && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-800 rounded-lg">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">{t('sleep.special_considerations_title')}</p>
              <p className="text-sm text-amber-800 dark:text-amber-300">{t(benchmark.notesKey)}</p>
            </div>
          )}
        </>
      )}

      {/* Nota explicativa */}
      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200" dangerouslySetInnerHTML={{ __html: t('sleep.benchmark_note') }} />
      </div>
    </Card>
  );
}
