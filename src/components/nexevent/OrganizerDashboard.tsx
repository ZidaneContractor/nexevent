'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import {
  Calendar, Users, BarChart3, Clock, CheckCircle2, XCircle,
  Loader2, Eye, FileText, Download, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventStore } from '@/store/event-store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export function OrganizerDashboard() {
  const { user } = useAuthStore();
  const { navigate } = useUIStore();
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [eventsRes, statsRes] = await Promise.all([
          fetch(`/api/events?status=&userId=${user.id}`),
          fetch(`/api/stats?userId=${user.id}`),
        ]);
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          // Filter to events organized by this user
          setEvents((data.events || []).filter((e: any) => e.organizer?.id === user.id));
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        }
      } catch {}
      setIsLoading(false);
    };
    load();
  }, [user]);

  const generateReport = async (eventId: string, title: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/report`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { toast.error('Failed to generate report'); return; }

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(55, 48, 163);
      doc.text('NexEvent - Event Report', 14, 22);
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text(data.event.title, 14, 34);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Venue: ${data.event.venue}`, 14, 42);
      doc.text(`Date: ${new Date(data.event.startDate).toLocaleDateString('en-IN')}`, 14, 48);
      doc.text(`Category: ${data.event.category}`, 14, 54);
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text('Attendance Summary', 14, 66);
      doc.setFontSize(10);
      doc.text(`Total Registered: ${data.stats.totalRegistered}`, 14, 74);
      doc.text(`Total Present: ${data.stats.totalPresent}`, 14, 80);
      doc.text(`Total Absent: ${data.stats.totalAbsent}`, 14, 86);
      doc.text(`Attendance Rate: ${data.stats.attendanceRate}%`, 14, 92);

      if (data.attendees?.length > 0) {
        autoTable(doc, {
          startY: 100,
          head: [['Name', 'USN', 'Department', 'Status', 'Check-in']],
          body: data.attendees.map((a: any) => [a.name, a.usn || '-', a.department || '-', a.status, a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('en-IN') : '-']),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [55, 48, 163] },
        });
      }

      doc.save(`${title.replace(/\s+/g, '_')}_Report.pdf`);
      toast.success('PDF report downloaded!');
    } catch { toast.error('PDF generation failed'); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const statCards = [
    { label: 'My Events', value: events.length, icon: Calendar, color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30' },
    { label: 'Total Registrations', value: stats?.userRegistrations || 0, icon: Users, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Active Events', value: events.filter(e => ['APPROVED', 'LIVE'].includes(e.status)).length, icon: Clock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Organized', value: stats?.userOrganizedEvents || 0, icon: BarChart3, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your events and view analytics</p>
        </div>
        <Button onClick={() => navigate('create-event')} className="bg-primary hover:bg-primary/90">
          <Calendar className="w-4 h-4 mr-2" /> New Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Events list */}
      <h2 className="font-semibold text-lg mb-4">My Events</h2>
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">You haven&apos;t created any events yet</p>
            <Button onClick={() => navigate('create-event')} className="mt-3 bg-primary hover:bg-primary/90">
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{event.title}</h3>
                      <Badge variant="secondary" className={`text-[10px] shrink-0 ${
                        event.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                        event.status === 'LIVE' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' :
                        event.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span>{event.venue}</span>
                      <span>{event._count?.registrations || 0} registered</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(event.status === 'APPROVED' || event.status === 'LIVE' || event.status === 'COMPLETED') && (
                      <Button variant="outline" size="sm" onClick={() => generateReport(event.id, event.title)}>
                        <Download className="w-3 h-3 mr-1" /> Report
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => navigate('event-detail', event.id)}>
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
