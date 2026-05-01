import { NextRequest, NextResponse } from 'next/server';
import { getHeartRateData, getHeartRateAverages } from '@/lib/queries-multiuser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'recent';
    const days = parseInt(searchParams.get('days') || '7');
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const userSlug = searchParams.get('user') || 'fer';

    if (type === 'averages') {
      const data = await getHeartRateAverages(days, startParam || undefined, endParam || undefined, userSlug);
      return NextResponse.json({ data });
    }

    const data = await getHeartRateData(
      startParam || '',
      endParam || '',
      userSlug
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Heart rate API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heart rate data' },
      { status: 500 }
    );
  }
}
