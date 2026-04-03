'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface BenchmarkData {
  sleepQuality: string;
  totalHours: string;
  deepSleep: string;
  remSleep: string;
  spo2: string;
  notes?: string;
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
        notes: 'El sueño profundo ayuda a regular glucosa. Mantén horario regular.',
      },
      cardiovascular: {
        sleepQuality: '70-80',
        totalHours: '7-8 horas',
        deepSleep: '90-126 min (22-28%)',
        remSleep: '84-108 min (18-23%)',
        spo2: '≥94%',
        notes: 'Evita sueño insuficiente (<6h). SPO2 bajo puede indicar apnea.',
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
        notes: 'Ciclos hormonales afectan el sueño. Monitorea patrones mensuales.',
      },
      cardiovascular: {
        sleepQuality: '70-80',
        totalHours: '7-8 horas',
        deepSleep: '96-132 min (23-29%)',
        remSleep: '84-108 min (18-23%)',
        spo2: '≥94%',
        notes: 'SPO2 bajo (<94%) puede indicar problemas. Consulta médico.',
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
        notes: 'Sueño insuficiente aumenta resistencia a insulina.',
      },
      cardiovascular: {
        sleepQuality: '65-78',
        totalHours: '7-8 horas',
        deepSleep: '84-114 min (20-25%)',
        remSleep: '72-102 min (16-22%)',
        spo2: '≥94%',
        notes: 'Apnea del sueño aumenta riesgo cardiovascular. Monitorea SPO2.',
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
        notes: 'Embarazo y menopausia afectan el sueño. Ajusta según ciclo de vida.',
      },
      cardiovascular: {
        sleepQuality: '65-78',
        totalHours: '7-8 horas',
        deepSleep: '84-120 min (20-26%)',
        remSleep: '72-102 min (16-22%)',
        spo2: '≥94%',
        notes: 'Riesgo CV aumenta post-menopausia. Prioriza calidad de sueño.',
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
        notes: 'Control glucémico nocturno crítico. Evita hipoglucemia nocturna.',
      },
      cardiovascular: {
        sleepQuality: '60-75',
        totalHours: '7-8 horas',
        deepSleep: '72-108 min (18-24%)',
        remSleep: '66-96 min (14-20%)',
        spo2: '≥92%',
        notes: 'SPO2 <92% requiere evaluación médica urgente. Apnea común.',
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
        notes: 'Menopausia altera sueño. Considera terapia hormonal si aplica.',
      },
      cardiovascular: {
        sleepQuality: '60-75',
        totalHours: '7-8 horas',
        deepSleep: '78-114 min (19-25%)',
        remSleep: '66-96 min (14-20%)',
        spo2: '≥92%',
        notes: 'Insomnio post-menopausia aumenta riesgo CV. Terapia del sueño.',
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
        notes: 'Neuropatía puede afectar el sueño. Monitoreo glucémico nocturno.',
      },
      cardiovascular: {
        sleepQuality: '55-70',
        totalHours: '7-8 horas',
        deepSleep: '60-96 min (15-21%)',
        remSleep: '54-84 min (12-18%)',
        spo2: '≥91%',
        notes: 'Apnea muy común (>50%). SPO2 <90% es emergencia médica.',
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
        notes: 'Poliuria nocturna común. Ajusta ingesta de líquidos vespertina.',
      },
      cardiovascular: {
        sleepQuality: '55-70',
        totalHours: '7-8 horas',
        deepSleep: '60-96 min (15-21%)',
        remSleep: '54-84 min (12-18%)',
        spo2: '≥91%',
        notes: 'ICC puede causar ortopnea. Eleva cabecera 30-45°.',
      },
    },
  },
};

export function SleepBenchmark() {
  const [ageRange, setAgeRange] = useState<string>('26-40');
  const [gender, setGender] = useState<string>('male');
  const [condition, setCondition] = useState<string>('healthy');
  
  const benchmark = benchmarks[ageRange]?.[gender]?.[condition];

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <div className="flex items-start gap-3 mb-4">
        <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-2xl font-bold text-blue-900">📊 Valores Recomendados</h3>
          <p className="text-sm text-blue-700 mt-1">
            Basado en estudios de salud del sueño y recomendaciones médicas
          </p>
        </div>
      </div>

      {/* Selectores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rango de Edad:
          </label>
          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-base font-medium focus:border-blue-500 focus:outline-none"
          >
            <option value="18-25">18-25 años</option>
            <option value="26-40">26-40 años</option>
            <option value="41-64">41-64 años</option>
            <option value="65+">65+ años</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Género:
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-base font-medium focus:border-blue-500 focus:outline-none"
          >
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Condición de Salud:
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-base font-medium focus:border-blue-500 focus:outline-none"
          >
            <option value="healthy">Saludable</option>
            <option value="diabetes">Diabetes</option>
            <option value="cardiovascular">Cardiovascular</option>
          </select>
        </div>
      </div>

      {/* Benchmarks */}
      {benchmark && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border-2 border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">💤 Calidad de Sueño</h4>
              <p className="text-2xl font-bold text-blue-600">{benchmark.sleepQuality}</p>
              <p className="text-sm text-gray-600 mt-1">Puntuación óptima</p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">⏰ Horas Totales</h4>
              <p className="text-2xl font-bold text-blue-600">{benchmark.totalHours}</p>
              <p className="text-sm text-gray-600 mt-1">Por noche</p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-red-100">
              <h4 className="font-bold text-red-900 mb-2">🫁 Oxigenación (SPO2)</h4>
              <p className="text-2xl font-bold text-red-600">{benchmark.spo2}</p>
              <p className="text-sm text-gray-600 mt-1">Saturación de oxígeno</p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-purple-100">
              <h4 className="font-bold text-purple-900 mb-2">💪 Sueño Profundo</h4>
              <p className="text-2xl font-bold text-purple-600">{benchmark.deepSleep}</p>
              <p className="text-sm text-gray-600 mt-1">Del total de sueño</p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-purple-100">
              <h4 className="font-bold text-purple-900 mb-2">💭 Sueño REM</h4>
              <p className="text-2xl font-bold text-purple-600">{benchmark.remSleep}</p>
              <p className="text-sm text-gray-600 mt-1">Del total de sueño</p>
            </div>
          </div>

          {/* Notas específicas por condición */}
          {benchmark.notes && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <p className="text-sm font-semibold text-amber-900 mb-1">⚠️ Consideraciones Especiales:</p>
              <p className="text-sm text-amber-800">{benchmark.notes}</p>
            </div>
          )}
        </>
      )}

      {/* Nota explicativa */}
      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Nota:</strong> Estos son valores generales basados en población sana. 
          Los valores ideales pueden variar según tu condición física, nivel de actividad y genética. 
          Consulta a un profesional de salud para recomendaciones personalizadas.
        </p>
      </div>
    </Card>
  );
}
