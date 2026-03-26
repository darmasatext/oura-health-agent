'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { Activity, Footprints, Flame, Target, Clock, Zap } from 'lucide-react';

// Lazy load de charts pesados
const StepsChart = dynamic(
  () => import('@/components/charts/StepsChart').then(m => ({ default: m.StepsChart })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
    ssr: false,
  }
);

const CaloriesChart = dynamic(
  () => import('@/components/charts/CaloriesChart').then(m => ({ default: m.CaloriesChart })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
    ssr: false,
  }
);

async function fetchActivityData(days: number) {
  const res = await fetch(`/api/activity?type=recent&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchActivityTotals(days: number) {
  const res = await fetch(`/api/activity?type=totals&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchMostActiveDay(days: number) {
  const res = await fetch(`/api/activity?type=goals&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function ActivityPage() {
  const [days, setDays] = useState(30);

  const { data: activityData, isLoading: loadingData } = useQuery({
    queryKey: ['activity-data', days],
    queryFn: () => fetchActivityData(days),
  });

  const { data: totals, isLoading: loadingTotals } = useQuery({
    queryKey: ['activity-totals', days],
    queryFn: () => fetchActivityTotals(days),
  });

  const { data: mostActive, isLoading: loadingMostActive } = useQuery({
    queryKey: ['most-active-day', days],
    queryFn: () => fetchMostActiveDay(days),
  });

  if (loadingData || loadingTotals || loadingMostActive) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-64 animate-pulse bg-gray-200 rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
          <div className="h-32 animate-pulse bg-gray-200 rounded" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse bg-gray-200 rounded" />
          <div className="h-80 animate-pulse bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const activityRecords = activityData?.data || [];
  const stats = totals?.data || {};
  const mostActiveDay = mostActive?.data || {};

  // Cálculos de métricas
  const avgActivity = Math.round(stats.avg_activity || 0);
  const totalSteps = stats.total_steps || 0;
  const totalCalories = Math.round(stats.total_calories || 0);
  const goalsMetPct = stats.total_days > 0 
    ? Math.round((stats.days_met_goal / stats.total_days) * 100) 
    : 0;
  const avgSedentaryHours = stats.avg_sedentary_hours || 0;
  const totalDistanceMeters = stats.total_distance_meters || 0;
  const totalDistanceKm = (totalDistanceMeters / 1000).toFixed(1);

  // Calcular promedio de pasos para insight
  const avgSteps = stats.total_days > 0 ? Math.round(totalSteps / stats.total_days) : 0;

  // Generar insight automático
  const generateInsight = () => {
    if (avgSteps < 8000) {
      return `Tu promedio es ${avgSteps.toLocaleString('es-MX')} pasos/día. Intenta caminar más durante el día - cada paso cuenta.`;
    } else if (goalsMetPct > 80) {
      return `¡Excelente! Cumpliste tu meta de pasos en ${goalsMetPct}% de los días. Mantienes gran consistencia.`;
    } else if (avgSedentaryHours > 10) {
      const hours = Math.floor(avgSedentaryHours);
      const minutes = Math.round((avgSedentaryHours - hours) * 60);
      return `Pasas ${hours}h ${minutes}min sentado en promedio. Toma breaks activos cada hora para mejorar tu salud.`;
    } else {
      return `Buen trabajo. Promedio: ${avgSteps.toLocaleString('es-MX')} pasos/día. Meta cumplida: ${goalsMetPct}% de días.`;
    }
  };

  // Formatear tiempo sedentario promedio
  const formatSedentaryTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}min`;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Actividad Física
          </h1>
          <p className="text-muted-foreground mt-1">
            Pasos, calorías y nivel de actividad diaria
          </p>
        </div>
        <DateRangePicker onRangeChange={setDays} />
      </div>

      {/* KPIs principales (4 cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Activity className="h-4 w-4" />
            <p>Nivel de Actividad Promedio</p>
          </div>
          <p className="text-3xl font-bold">{avgActivity}/100</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Footprints className="h-4 w-4" />
            <p>Pasos Totales</p>
          </div>
          <p className="text-3xl font-bold">{totalSteps.toLocaleString('es-MX')}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Flame className="h-4 w-4" />
            <p>Calorías Quemadas</p>
          </div>
          <p className="text-3xl font-bold">{totalCalories.toLocaleString('es-MX')}</p>
          <p className="text-xs text-muted-foreground mt-1">kcal activas</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Target className="h-4 w-4" />
            <p>Metas Cumplidas</p>
          </div>
          <p className="text-3xl font-bold">{goalsMetPct}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.days_met_goal}/{stats.total_days} días
          </p>
        </Card>
      </div>

      {/* Gráficas principales (2 gráficas) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Pasos Diarios</h3>
          <StepsChart data={activityRecords} goal={10000} />
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Calorías: Activas vs Totales</h3>
          <CaloriesChart data={activityRecords} />
        </Card>
      </div>

      {/* Cards adicionales (3 cards) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">Tiempo Sedentario Promedio</h3>
          </div>
          <p className="text-2xl font-bold">
            {formatSedentaryTime(avgSedentaryHours)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Por día en promedio
          </p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Distancia Total Recorrida</h3>
          </div>
          <p className="text-2xl font-bold">
            {totalDistanceKm} km
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Equivalente en caminata
          </p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Footprints className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Día Más Activo</h3>
          </div>
          <p className="text-2xl font-bold">
            {mostActiveDay.steps?.toLocaleString('es-MX')} pasos
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {mostActiveDay.calendar_date || 'N/A'}
          </p>
        </Card>
      </div>

      {/* Insight automático */}
      <Card className="bg-blue-50 border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Insight de Actividad</h3>
        <p className="text-blue-800">{generateInsight()}</p>
      </Card>
    </div>
  );
}
