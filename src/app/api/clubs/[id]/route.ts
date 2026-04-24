import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const club = await db.club.findUnique({
      where: { id },
      include: {
        facultyAdvisor: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        events: {
          where: { status: { in: ['APPROVED', 'LIVE'] } },
          take: 5,
          orderBy: { startDate: 'asc' },
          include: { _count: { select: { registrations: true } } },
        },
        _count: { select: { members: true, events: true } },
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    return NextResponse.json({ club });
  } catch (error) {
    console.error('Club fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
