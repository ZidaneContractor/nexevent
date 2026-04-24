'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import {
  Shield, CheckCircle2, XCircle, Clock, Calendar, Users,
  BarChart3, Loader2, Eye, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function AdminPanel() {
  const { user } = useAuthStore();
  const { navigate } = useUIStore();
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [pendingRes, allRes, statsRes] = await Promise.all([
          fetch(`/api/events?status=PENDING_APPROVAL&userId=${user.id}`),
          fetch(`/api/events?status=&userId=${user.id}`),
          fetch(`/api/stats?userId=${user.id}`),
        ]);
        if (pendingRes.ok) { const d = await pendingRes.json(); setPendingEvents(d.events || []); }
        if (allRes.ok) { const d = await allRes.json(); setAllEvents(d.events || []); }
        if (statsRes.ok) { const d = await statsRes.json(); setStats(d.stats); }
      } catch {}
      setIsLoading(false);
    };
    load();
  }, [user]);

  const handleApproval = async (eventId: string, action: 'approve' | 'reject') => {
    if (!user) return;
    try {
      const res = await fetch(`/api/events/${eventId}/approve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, action }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(action === 'approve' ? 'Event approved!' : 'Event rejected');
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
    } catch { toast.error('Action failed'); }
  };

  if (!user || (user.role !== 'FACULTY' && user.role !== 'ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium">Access Restricted</p>
          <p className="text-sm text-muted-foreground">Only faculty and admins can access this panel.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const statCards = [
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: Calendar, color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30' },
    { label: 'Active Now', value: stats?.activeEvents || 0, icon: Clock, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Pending Review', value: stats?.pendingApprovals || 0, icon: Shield, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Total Registrations', value: stats?.totalRegistrations || 0, icon: Users, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" /> Admin Panel
        </h1>
        <p className="text-sm text-muted-foreground">Review events, manage approvals, and view analytics</p>
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

      {/* Pending Approvals */}
      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Pending Approvals
          {pendingEvents.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              {pendingEvents.length}
            </Badge>
          )}
        </h2>

        {pendingEvents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All caught up! No pending approvals.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingEvents.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-amber-200 dark:border-amber-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          <span>{event.venue}</span>
                          <span>{event.category}</span>
                        </div>
                        {event.organizer && (
                          <p className="text-xs text-muted-foreground mt-1">By {event.organizer.name}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApproval(event.id, 'approve')}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button variant="destructive" size="sm"
                          onClick={() => handleApproval(event.id, 'reject')}>
                          <XCircle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                        <Button variant="ghost" size="sm"
                          onClick={() => navigate('event-detail', event.id)}>
                          <Eye className="w-3 h-3 mr-1" /> Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* All Events Overview */}
      <div>
        <h2 className="font-semibold text-lg mb-4">All Events</h2>
        <div className="space-y-2">
          {allEvents.slice(0, 10).map((event) => (
            <Card key={event.id} className="hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => navigate('event-detail', event.id)}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`text-[10px] ${
                    event.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    event.status === 'LIVE' ? 'bg-rose-100 text-rose-700' :
                    event.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' : ''
                  }`}>{event.status}</Badge>
                  <span className="text-sm font-medium">{event.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{event._count?.registrations || 0} reg</span>
                  <span>{new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
