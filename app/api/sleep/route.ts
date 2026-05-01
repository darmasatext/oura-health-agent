import { NextResponse } from 'next/server';
import { getSleepData, getSleepAverages } from '@/lib/queries-multiuser';
import { subDays, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'recent';
    const days = parseInt(searchParams.get('days') || '30');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const userSlug = searchParams.get('user') || 'fer'; // Default: Fer

    if (type === 'recent') {
      // Usar fechas del parámetro si están disponibles, sino calcular desde hoy
      let endDate: string;
      let startDate: string;
      
      if (start && end) {
        // Usuario seleccionó fechas específicas
        startDate = start;
        endDate = end;
      } else {
        // Calcular desde hoy (backward compatibility)
        endDate = format(new Date(), 'yyyy-MM-dd');
        startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      }
      
      const data = await getSleepData(startDate, endDate, userSlug);
      return NextResponse.json(
        { success: true, data },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          }
        }
      );
    }

    if (type === 'averages') {
      // Usar fechas del parámetro si están disponibles
      let endDate: string;
      let startDate: string;
      
      if (start && end) {
        startDate = start;
        endDate = end;
      } else {
        endDate = format(new Date(), 'yyyy-MM-dd');
        startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      }
      
      const data = await getSleepAverages(days, startDate, endDate, userSlug);
      return NextResponse.json(
        { success: true, data },
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
    console.error('Sleep API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch sleep data' 
    }, { status: 500 });
  }
}
