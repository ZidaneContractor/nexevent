import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { simpleHash } from '@/lib/geo';

export async function POST() {
  try {
    const existingUsers = await db.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: existingUsers });
    }

    const admin = await db.user.create({ data: { name: 'Dr. Ramesh Kumar', email: 'admin@vvce.ac.in', passwordHash: simpleHash('admin123'), role: 'ADMIN', department: 'Administration', phone: '9876543210' } });
    const faculty1 = await db.user.create({ data: { name: 'Dr. Priya Sharma', email: 'priya.sharma@vvce.ac.in', passwordHash: simpleHash('faculty123'), role: 'FACULTY', department: 'Computer Science', phone: '9876543211' } });
    const faculty2 = await db.user.create({ data: { name: 'Prof. Anil Desai', email: 'anil.desai@vvce.ac.in', passwordHash: simpleHash('faculty123'), role: 'FACULTY', department: 'Electronics', phone: '9876543212' } });
    const org1 = await db.user.create({ data: { name: 'Rahul Gowda', email: 'rahul.gowda@vvce.ac.in', passwordHash: simpleHash('org123'), role: 'ORGANIZER', department: 'Computer Science', usn: '4VV21CS001', phone: '9876543213' } });
    const org2 = await db.user.create({ data: { name: 'Sneha Rao', email: 'sneha.rao@vvce.ac.in', passwordHash: simpleHash('org123'), role: 'ORGANIZER', department: 'Information Science', usn: '4VV21IS002', phone: '9876543214' } });
    const org3 = await db.user.create({ data: { name: 'Vikram M', email: 'vikram.m@vvce.ac.in', passwordHash: simpleHash('org123'), role: 'ORGANIZER', department: 'Mechanical', usn: '4VV21ME003', phone: '9876543215' } });

    const students: any[] = [];
    const studentNames = ['Aditi N','Bharath K','Chitra R','Deepak S','Esha P','Farhan A','Geetha L','Harsha V','Ishaan B','Jaya S','Kiran M','Lakshmi D','Manoj T','Nandini G','Om P'];
    const depts = ['Computer Science','Information Science','Electronics','Mechanical','Civil'];
    for (let i = 0; i < studentNames.length; i++) {
      const s = await db.user.create({ data: { name: studentNames[i], email: `${studentNames[i].toLowerCase().replace(' ','.')}@vvce.ac.in`, passwordHash: simpleHash('student123'), role: 'STUDENT', department: depts[i % 5], usn: `4VV22CS${String(i+1).padStart(3,'0')}` } });
      students.push(s);
    }

    const club1 = await db.club.create({ data: { name: 'CodeCrafters', slug: 'codecrafters', description: 'The premier coding and competitive programming club of VVCE. We hack, we code, we conquer.', category: 'TECHNICAL', facultyAdvisorId: faculty1.id, foundedYear: 2019 } });
    const club2 = await db.club.create({ data: { name: 'Rangataranga', slug: 'rangataranga', description: 'VVCEs vibrant cultural club celebrating art, music, dance, and theater.', category: 'CULTURAL', facultyAdvisorId: faculty2.id, foundedYear: 2018 } });
    const club3 = await db.club.create({ data: { name: 'RoboVikas', slug: 'robovikas', description: 'Robotics and IoT club building the future. From line followers to autonomous drones.', category: 'TECHNICAL', facultyAdvisorId: faculty1.id, foundedYear: 2020 } });
    const club4 = await db.club.create({ data: { name: 'SportX', slug: 'sportx', description: 'The sports and fitness club. Cricket, football, basketball, athletics - we play it all.', category: 'SPORTS', facultyAdvisorId: faculty2.id, foundedYear: 2017 } });
    const club5 = await db.club.create({ data: { name: 'GreenWave', slug: 'greenwave', description: 'Environmental and social responsibility club. Making VVCE and Mysuru greener.', category: 'SOCIAL', facultyAdvisorId: faculty1.id, foundedYear: 2021 } });

    await db.clubMember.createMany({ data: [
      { userId: org1.id, clubId: club1.id, role: 'president' }, { userId: students[0].id, clubId: club1.id, role: 'secretary' }, { userId: students[1].id, clubId: club1.id, role: 'member' }, { userId: students[2].id, clubId: club1.id, role: 'member' },
      { userId: org2.id, clubId: club2.id, role: 'president' }, { userId: students[3].id, clubId: club2.id, role: 'secretary' }, { userId: students[4].id, clubId: club2.id, role: 'member' }, { userId: students[5].id, clubId: club2.id, role: 'member' },
      { userId: org3.id, clubId: club3.id, role: 'president' }, { userId: students[7].id, clubId: club3.id, role: 'member' }, { userId: students[8].id, clubId: club3.id, role: 'member' },
      { userId: students[9].id, clubId: club4.id, role: 'president' }, { userId: students[10].id, clubId: club4.id, role: 'member' },
      { userId: students[11].id, clubId: club5.id, role: 'president' }, { userId: students[12].id, clubId: club5.id, role: 'member' },
    ] });

    const now = new Date(); const dayMs = 86400000;
    const event1 = await db.event.create({ data: { title: 'HackVerse 2026', slug: 'hackverse-2026', description: 'VVCEs flagship 24-hour hackathon! Build innovative solutions to real-world problems. Teams of 2-4 members. Prizes worth ₹50,000. Food and refreshments provided.', category: 'HACKATHON', status: 'APPROVED', venue: 'VVCE Auditorium & Labs', venueLat: 12.3136, venueLng: 76.6499, geoFenceRadius: 500, startDate: new Date(now.getTime()+7*dayMs), endDate: new Date(now.getTime()+8*dayMs), registrationDeadline: new Date(now.getTime()+5*dayMs), maxParticipants: 200, isPublic: true, tags: 'hackathon,coding,innovation', organizerId: org1.id, clubId: club1.id, approverId: faculty1.id, approvedAt: now } });
    const event2 = await db.event.create({ data: { title: 'Swarasangama - Musical Night', slug: 'swarasangama', description: 'An evening of classical and contemporary music performances by VVCE students. Open mic session included.', category: 'CULTURAL', status: 'APPROVED', venue: 'VVCE Open Air Theatre', venueLat: 12.3138, venueLng: 76.6502, geoFenceRadius: 300, startDate: new Date(now.getTime()+3*dayMs), endDate: new Date(now.getTime()+3*dayMs+4*3600000), registrationDeadline: new Date(now.getTime()+2*dayMs), maxParticipants: 500, isPublic: true, tags: 'music,cultural,performance', organizerId: org2.id, clubId: club2.id, approverId: faculty2.id, approvedAt: now } });
    const event3 = await db.event.create({ data: { title: 'Arduino Workshop: IoT Basics', slug: 'arduino-iot', description: 'Hands-on workshop covering Arduino fundamentals, sensor interfacing, and IoT protocols. Take home your Arduino kit!', category: 'WORKSHOP', status: 'APPROVED', venue: 'CS Lab 301, VVCE', venueLat: 12.3135, venueLng: 76.6498, geoFenceRadius: 200, startDate: new Date(now.getTime()+10*dayMs), endDate: new Date(now.getTime()+10*dayMs+6*3600000), registrationDeadline: new Date(now.getTime()+8*dayMs), maxParticipants: 40, isPublic: true, requiresApproval: true, tags: 'arduino,iot,workshop', organizerId: org3.id, clubId: club3.id, approverId: faculty1.id, approvedAt: now } });
    const event4 = await db.event.create({ data: { title: 'VVCE Cricket Tournament', slug: 'vvce-cricket', description: 'Inter-department cricket tournament. Gather your team of 11 and compete for the VVCE Cricket Trophy!', category: 'SPORTS', status: 'LIVE', venue: 'VVCE Sports Ground', venueLat: 12.314, venueLng: 76.6505, geoFenceRadius: 400, startDate: new Date(now.getTime()-1*dayMs), endDate: new Date(now.getTime()+2*dayMs), maxParticipants: 120, isPublic: true, tags: 'cricket,sports,tournament', organizerId: students[9].id, clubId: club4.id, approverId: faculty2.id, approvedAt: new Date(now.getTime()-3*dayMs) } });
    const event5 = await db.event.create({ data: { title: 'Green Mysuru Cleanup Drive', slug: 'green-cleanup', description: 'Join us for a campus and neighborhood cleanup drive. Gloves and bags provided. Certificate for all volunteers.', category: 'SOCIAL', status: 'APPROVED', venue: 'VVCE Main Gate', startDate: new Date(now.getTime()+5*dayMs), endDate: new Date(now.getTime()+5*dayMs+3*3600000), registrationDeadline: new Date(now.getTime()+4*dayMs), maxParticipants: 100, isPublic: true, tags: 'environment,cleanup,volunteering', organizerId: students[11].id, clubId: club5.id, approverId: faculty1.id, approvedAt: now } });
    const event6 = await db.event.create({ data: { title: 'AI/ML Seminar: Future of Intelligence', slug: 'ai-ml-seminar', description: 'Distinguished lecture series on AI and Machine Learning. Industry speakers from Google, Microsoft, and IISc.', category: 'SEMINAR', status: 'PENDING_APPROVAL', venue: 'VVCE Seminar Hall', startDate: new Date(now.getTime()+14*dayMs), endDate: new Date(now.getTime()+14*dayMs+3*3600000), maxParticipants: 150, isPublic: true, tags: 'ai,machine-learning,seminar', organizerId: org1.id, clubId: club1.id } });
    const event7 = await db.event.create({ data: { title: 'Street Play Competition', slug: 'street-play', description: 'Express creativity through powerful street plays. Theme: Social Issues in Modern India. Teams of 8-15 members.', category: 'CULTURAL', status: 'APPROVED', venue: 'VVCE Quadrangle', startDate: new Date(now.getTime()+4*dayMs), endDate: new Date(now.getTime()+4*dayMs+5*3600000), maxParticipants: 80, isPublic: true, tags: 'drama,theater,street-play', organizerId: org2.id, clubId: club2.id, approverId: faculty2.id, approvedAt: now } });

    const regData: any[] = [];
    for (let i = 0; i < 8; i++) { const r = await db.eventRegistration.create({ data: { eventId: event4.id, userId: students[i].id, status: 'CONFIRMED', qrCode: `NEXEVENT-${event4.id}-${students[i].id}-${Date.now().toString(36)}`, confirmedAt: now } }); regData.push(r); }
    for (let i = 0; i < 5; i++) { await db.attendance.create({ data: { registrationId: regData[i].id, eventId: event4.id, userId: students[i].id, status: i < 4 ? 'PRESENT' : 'LATE', checkInTime: new Date(now.getTime()-(4-i)*3600000), isWithinGeoFence: true } }); }

    await db.eventRegistration.create({ data: { eventId: event1.id, userId: students[0].id, status: 'CONFIRMED', qrCode: `QR-${event1.id}-${students[0].id}`, confirmedAt: now } });
    await db.eventRegistration.create({ data: { eventId: event1.id, userId: students[1].id, status: 'CONFIRMED', qrCode: `QR-${event1.id}-${students[1].id}`, confirmedAt: now } });
    await db.eventRegistration.create({ data: { eventId: event2.id, userId: students[2].id, status: 'CONFIRMED', qrCode: `QR-${event2.id}-${students[2].id}`, confirmedAt: now } });
    await db.eventRegistration.create({ data: { eventId: event2.id, userId: students[3].id, status: 'CONFIRMED', qrCode: `QR-${event2.id}-${students[3].id}`, confirmedAt: now } });
    await db.eventRegistration.create({ data: { eventId: event5.id, userId: students[12].id, status: 'CONFIRMED', qrCode: `QR-${event5.id}-${students[12].id}`, confirmedAt: now } });

    await db.notification.createMany({ data: [
      { userId: org1.id, title: 'Event Approved!', message: 'Your event "HackVerse 2026" has been approved by Dr. Priya Sharma.', type: 'success' },
      { userId: org1.id, title: 'New Registration', message: 'Aditi N has registered for HackVerse 2026.', type: 'info' },
      { userId: org2.id, title: 'Event Approved!', message: 'Your event "Swarasangama" has been approved.', type: 'success' },
      { userId: org1.id, title: 'Pending Approval', message: 'Your event "AI/ML Seminar" is awaiting faculty approval.', type: 'warning' },
    ] });

    return NextResponse.json({ message: 'Database seeded successfully!', users: 20, clubs: 5, events: 7 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}
