import { NextResponse } from 'next/server';
import { getWeekOverWeekComparison, getCurrentVsHistorical } from '@/lib/queries-multiuser';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'wow';
    const userSlug = searchParams.get('user') || 'fer';

    if (type === 'wow') {
      const data = await getWeekOverWeekComparison(userSlug);
      return NextResponse.json(
        { success: true, data },
        { 
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          }
        }
      );
    }

    if (type === 'historical') {
      const data = await getCurrentVsHistorical(userSlug);
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
    console.error('Compare API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch comparison data' 
    }, { status: 500 });
  }
}
