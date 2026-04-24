import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [
      totalEvents,
      activeEvents,
      totalClubs,
      totalRegistrations,
      userRegistrations,
      userOrganizedEvents,
      pendingApprovals,
    ] = await Promise.all([
      db.event.count({ where: { status: { in: ['APPROVED', 'LIVE', 'COMPLETED'] } } }),
      db.event.count({ where: { status: { in: ['APPROVED', 'LIVE'] }, startDate: { gte: new Date() } } }),
      db.club.count({ where: { isActive: true } }),
      db.eventRegistration.count({ where: { status: { not: 'CANCELLED' } } }),
      db.eventRegistration.count({ where: { userId, status: { not: 'CANCELLED' } } }),
      db.event.count({ where: { organizerId: userId } }),
      ['FACULTY', 'ADMIN'].includes(user.role)
        ? db.event.count({ where: { status: 'PENDING_APPROVAL' } })
        : Promise.resolve(0),
    ]);

    const categoryBreakdown = await db.event.groupBy({
      by: ['category'],
      where: { status: { in: ['APPROVED', 'LIVE', 'COMPLETED'] } },
      _count: { category: true },
    });

    return NextResponse.json({
      stats: {
        totalEvents,
        activeEvents,
        totalClubs,
        totalRegistrations,
        userRegistrations,
        userOrganizedEvents,
        pendingApprovals,
        categoryBreakdown: categoryBreakdown.map(c => ({
          category: c.category,
          count: c._count.category,
        })),
      },
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
