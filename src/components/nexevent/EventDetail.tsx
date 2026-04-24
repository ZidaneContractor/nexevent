'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useEventStore } from '@/store/event-store';
import {
  ArrowLeft, Calendar, MapPin, Clock, Users, Share2,
  QrCode, CheckCircle2, XCircle, Loader2, Tag, Building2,
  FileText, Download, ExternalLink, User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const statusColors: Record<string, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  LIVE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const categoryIcons: Record<string, string> = {
  HACKATHON: '💻', TECHNICAL: '⚡', CULTURAL: '🎭', WORKSHOP: '🔧',
  SEMINAR: '🎓', SPORTS: '🏆', SOCIAL: '🌱', OTHER: '📌',
};

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(d: string | Date) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function EventDetail() {
  const { user, isAuthenticated } = useAuthStore();
  const { navigate, selectedEventId } = useUIStore();
  const { currentEvent, isLoading, fetchEventById, registerForEvent, cancelRegistration, approveEvent } = useEventStore();
  const [registering, setRegistering] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [userReg, setUserReg] = useState<any>(null);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventById(selectedEventId);
    }
  }, [selectedEventId, fetchEventById]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedEventId) return;
      const res = await fetch(`/api/events/${selectedEventId}${user ? `?userId=${user.id}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setUserReg(data.userRegistration);
      }
    };
    loadDetail();
  }, [selectedEventId, user]);

  const handleRegister = async () => {
    if (!user) return;
    setRegistering(true);
    try {
      const res = await fetch(`/api/events/${selectedEventId}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Registered successfully!');
      fetchEventById(selectedEventId!);
      const detailRes = await fetch(`/api/events/${selectedEventId}?userId=${user.id}`);
      if (detailRes.ok) { const d = await detailRes.json(); setUserReg(d.userRegistration); }
    } catch { toast.error('Registration failed'); }
    setRegistering(false);
  };

  const handleCancel = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/events/${selectedEventId}/register?userId=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Registration cancelled');
      fetchEventById(selectedEventId!);
      setUserReg(null);
    } catch { toast.error('Failed to cancel'); }
  };

  const handleApprove = async (action: 'approve' | 'reject') => {
    if (!user) return;
    try {
      const res = await fetch(`/api/events/${selectedEventId}/approve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, action }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(action === 'approve' ? 'Event approved!' : 'Event rejected');
      fetchEventById(selectedEventId!);
    } catch { toast.error('Action failed'); }
  };

  const generatePDF = async () => {
    if (!currentEvent) return;
    try {
      const res = await fetch(`/api/events/${selectedEventId}/report`, { method: 'POST' });
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

      if (data.attendees && data.attendees.length > 0) {
        autoTable(doc, {
          startY: 100,
          head: [['Name', 'USN', 'Department', 'Status', 'Check-in Time']],
          body: data.attendees.map((a: any) => [
            a.name, a.usn || '-', a.department || '-',
            a.status, a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('en-IN') : '-'
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [55, 48, 163] },
        });
      }

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Generated by NexEvent | VVCE Campus Innovation 2026', 14, doc.internal.pageSize.height - 10);

      doc.save(`${data.event.title.replace(/\s+/g, '_')}_Report.pdf`);
      toast.success('PDF report downloaded!');
    } catch { toast.error('PDF generation failed'); }
  };

  if (isLoading || !currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const event = currentEvent as any;
  const isOrganizer = user && (event.organizerId === user.id || user.role === 'ADMIN');
  const isFaculty = user && (user.role === 'FACULTY' || user.role === 'ADMIN');
  const canRegister = isAuthenticated && ['APPROVED', 'LIVE'].includes(event.status) && !userReg;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back button */}
      <button onClick={() => navigate('feed')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{categoryIcons[event.category] || '📌'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-xs ${statusColors[event.status]}`}>
                    {event.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 animate-pulse" />}
                    {event.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{event.category}</Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">{event.title}</h1>
              </div>
            </div>

            {/* Event details grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>{formatTime(event.startDate)} — {formatTime(event.endDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <span>{event._count?.registrations || event.registrations?.length || 0} registered{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}</span>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="font-semibold mb-2">About This Event</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
          </motion.div>

          {/* Tags */}
          {event.tags && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.split(',').filter(Boolean).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />{tag.trim()}
                </Badge>
              ))}
            </div>
          )}

          {/* Registration list for organizer */}
          {isOrganizer && event.registrations && event.registrations.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Registrations ({event.registrations.length})</CardTitle>
                </CardHeader>
                <CardContent className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {event.registrations.map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/30 text-sm">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{r.user?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                          {r.attendance && <Badge className="text-[10px] bg-emerald-100 text-emerald-700">Checked in</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Approval section for faculty */}
          {isFaculty && event.status === 'PENDING_APPROVAL' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-amber-700 dark:text-amber-300">⏳ Pending Your Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Review this event and approve or reject it.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove('approve')} className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button variant="destructive" onClick={() => handleApprove('reject')}>
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Registration card */}
          <Card className="sticky top-20">
            <CardContent className="p-4 space-y-4">
              {userReg ? (
                <div className="text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">You&apos;re Registered!</p>
                    <Badge variant="outline" className="text-xs mt-1">{userReg.status}</Badge>
                  </div>
                  {userReg.qrCode && (
                    <div>
                      <Button variant="outline" size="sm" className="w-full mb-2"
                        onClick={() => setShowQR(!showQR)}>
                        <QrCode className="w-3 h-3 mr-1" /> {showQR ? 'Hide' : 'Show'} QR Code
                      </Button>
                      <AnimatePresence>
                        {showQR && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col items-center p-3 bg-white rounded-lg">
                            <QRCodeSVG value={userReg.qrCode} size={160} />
                            <p className="text-[10px] text-gray-500 mt-2">Scan at venue to check in</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive"
                    onClick={handleCancel}>
                    Cancel Registration
                  </Button>
                </div>
              ) : canRegister ? (
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleRegister} disabled={registering}>
                  {registering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                  Register Now
                </Button>
              ) : !isAuthenticated ? (
                <p className="text-sm text-center text-muted-foreground">Sign in to register</p>
              ) : (
                <p className="text-sm text-center text-muted-foreground">
                  {event.status === 'COMPLETED' ? 'Event has ended' : event.status === 'PENDING_APPROVAL' ? 'Event pending approval' : 'Registration not available'}
                </p>
              )}

              <Separator />

              {/* Organizer info */}
              {event.organizer && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Organized by</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {event.organizer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.organizer.name}</p>
                      {event.club && <p className="text-xs text-muted-foreground">{event.club.name}</p>}
                    </div>
                  </div>
                </div>
              )}

              {isOrganizer && (
                <>
                  <Separator />
                  <Button variant="outline" size="sm" className="w-full" onClick={generatePDF}>
                    <Download className="w-3 h-3 mr-1" /> Generate PDF Report
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Zap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}
