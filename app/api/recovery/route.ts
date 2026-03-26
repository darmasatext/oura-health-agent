import { NextResponse } from 'next/server';
import { getRecoveryData, getRecoveryAverages } from '@/lib/queries';
import { subDays, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'recent';
    const days = parseInt(searchParams.get('days') || '30');

    if (type === 'recent') {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      
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
      const data = await getRecoveryAverages(days);
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
