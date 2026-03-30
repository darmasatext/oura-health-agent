import { NextResponse } from 'next/server';
import { getRecoveryData, getRecoveryAverages } from '@/lib/queries';
import { subDays, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'recent';
    const days = parseInt(searchParams.get('days') || '30');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (type === 'recent') {
      let endDate: string;
      let startDate: string;
      
      if (start && end) {
        startDate = start;
        endDate = end;
      } else {
        endDate = format(new Date(), 'yyyy-MM-dd');
        startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      }
      
      const data = await getRecoveryData(startDate, endDate);
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
      
      const data = await getRecoveryAverages(days, startDate, endDate);
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
    console.error('Recovery API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch recovery data' 
    }, { status: 500 });
  }
}
