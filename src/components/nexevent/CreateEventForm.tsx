'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useEventStore, EventCategory } from '@/store/event-store';
import {
  Calendar, MapPin, Clock, Users, Tag, Loader2,
  CheckCircle2, Building2, Shield, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const categories: { value: EventCategory; label: string; icon: string }[] = [
  { value: 'TECHNICAL', label: 'Technical', icon: '⚡' },
  { value: 'CULTURAL', label: 'Cultural', icon: '🎭' },
  { value: 'SPORTS', label: 'Sports', icon: '🏆' },
  { value: 'WORKSHOP', label: 'Workshop', icon: '🔧' },
  { value: 'SEMINAR', label: 'Seminar', icon: '🎓' },
  { value: 'HACKATHON', label: 'Hackathon', icon: '💻' },
  { value: 'SOCIAL', label: 'Social', icon: '🌱' },
  { value: 'OTHER', label: 'Other', icon: '📌' },
];

export function CreateEventForm() {
  const { user } = useAuthStore();
  const { navigate } = useUIStore();
  const { createEvent, isCreating } = useEventStore();
  const [clubs, setClubs] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'TECHNICAL' as EventCategory,
    venue: '', startDate: '', endDate: '', registrationDeadline: '',
    maxParticipants: '', tags: '', clubId: '',
    venueLat: '', venueLng: '', geoFenceRadius: '200',
    isPublic: true, requiresApproval: false,
  });

  React.useEffect(() => {
    fetch('/api/clubs').then(r => r.json()).then(d => setClubs(d.clubs || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.title || !form.description || !form.venue || !form.startDate || !form.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data: any = {
        ...form,
        userId: user.id,
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null,
        venueLat: form.venueLat ? parseFloat(form.venueLat) : null,
        venueLng: form.venueLng ? parseFloat(form.venueLng) : null,
        geoFenceRadius: form.geoFenceRadius ? parseFloat(form.geoFenceRadius) : null,
        clubId: form.clubId || null,
      };
      await createEvent(data);
      toast.success('Event created! Pending faculty approval.');
      navigate('dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event');
    }
  };

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'FACULTY' && user.role !== 'ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">Only organizers and faculty can create events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create Event</h1>
          <p className="text-sm text-muted-foreground">Submit a new event for faculty approval</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Event Title *</Label>
                <Input placeholder="e.g., HackVerse 2026" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-9" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Description *</Label>
                <Textarea placeholder="Describe your event in detail..." value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Category *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as EventCategory })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Club</Label>
                  <Select value={form.clubId} onValueChange={(v) => setForm({ ...form, clubId: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select club" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No club</SelectItem>
                      {clubs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tags (comma separated)</Label>
                <Input placeholder="hackathon, coding, innovation" value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })} className="h-9" />
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Venue */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Schedule & Venue</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Venue *</Label>
                <Input placeholder="e.g., VVCE Auditorium" value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })} className="h-9" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Start Date & Time *</Label>
                  <Input type="datetime-local" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="h-9" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">End Date & Time *</Label>
                  <Input type="datetime-local" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="h-9" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Registration Deadline</Label>
                <Input type="datetime-local" value={form.registrationDeadline}
                  onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} className="h-9" />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Max Participants</Label>
                  <Input type="number" placeholder="Leave empty for unlimited" value={form.maxParticipants}
                    onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Geo-fence Radius (meters)</Label>
                  <Input type="number" placeholder="200" value={form.geoFenceRadius}
                    onChange={(e) => setForm({ ...form, geoFenceRadius: e.target.value })} className="h-9" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
                  <Label className="text-xs">Public Event</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.requiresApproval} onCheckedChange={(v) => setForm({ ...form, requiresApproval: v })} />
                  <Label className="text-xs">Requires Registration Approval</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/90">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Submit for Approval
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('feed')}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
