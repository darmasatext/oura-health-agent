import { NextResponse } from 'next/server';
import { getActivityData, getActivityTotals, getMostActiveDay } from '@/lib/queries-multiuser';
import { subDays, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'recent';
    const days = parseInt(searchParams.get('days') || '7');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const userSlug = searchParams.get('user') || 'fer';

    if (type === 'recent') {
      // Usar fechas del parámetro si están disponibles, sino calcular desde hoy
      let endDate: string;
      let startDate: string;
      
      if (start && end) {
        startDate = start;
        endDate = end;
      } else {
        endDate = format(new Date(), 'yyyy-MM-dd');
        startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      }
      
      const data = await getActivityData(startDate, endDate, userSlug);
      
      // Parse números correctamente
      const parsedData = data.map(row => ({
        ...row,
        activity_score: row.activity_score ? parseFloat(row.activity_score) : null,
        steps: row.steps ? parseInt(row.steps) : null,
        active_calories: row.active_calories ? parseFloat(row.active_calories) : null,
        total_calories: row.total_calories ? parseFloat(row.total_calories) : null,
        sedentary_time_seconds: row.sedentary_time_seconds ? parseInt(row.sedentary_time_seconds) : null,
        equivalent_walking_distance_meters: row.equivalent_walking_distance_meters ? parseFloat(row.equivalent_walking_distance_meters) : null,
      }));
      
      return NextResponse.json(
        { success: true, data: parsedData },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          }
        }
      );
    }

    if (type === 'totals') {
      const data = await getActivityTotals(days, start || undefined, end || undefined, userSlug);
      
      // Parse números correctamente
      const parsedData = {
        avg_activity: data?.avg_activity ? parseFloat(data.avg_activity) : null,
        total_steps: data?.total_steps ? parseInt(data.total_steps) : null,
        total_calories: data?.total_calories ? parseFloat(data.total_calories) : null,
        avg_sedentary_hours: data?.avg_sedentary_hours ? parseFloat(data.avg_sedentary_hours) : null,
        total_distance_meters: data?.total_distance_meters ? parseFloat(data.total_distance_meters) : null,
        total_days: data?.total_days ? parseInt(data.total_days) : null,
        days_met_goal: data?.days_met_goal ? parseInt(data.days_met_goal) : null,
      };
      
      return NextResponse.json(
        { success: true, data: parsedData },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          }
        }
      );
    }

    if (type === 'goals') {
      const mostActiveDay = await getMostActiveDay(days, start || undefined, end || undefined, userSlug);
      
      // Parse números correctamente
      const parsedData = mostActiveDay ? {
        calendar_date: mostActiveDay.calendar_date,
        steps: mostActiveDay.steps ? parseInt(mostActiveDay.steps) : null,
        activity_score: mostActiveDay.activity_score ? parseFloat(mostActiveDay.activity_score) : null,
      } : null;
      
      return NextResponse.json(
        { success: true, data: parsedData },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          }
        }
      );
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid type' 
    }, { status: 400 });

  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch activity data' 
    }, { status: 500 });
  }
}
