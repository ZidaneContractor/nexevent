'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { User, Mail, Building2, Hash, Phone, Calendar, Users, Award, Loader2, Edit3, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function ProfileView() {
  const { user, updateProfile } = useAuthStore();
  const { navigate } = useUIStore();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', department: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/users/me?userId=${user.id}`);
        if (res.ok) { const d = await res.json(); setProfile(d.user); setEditForm({ name: d.user.name, phone: d.user.phone || '', department: d.user.department || '' }); }
      } catch {}
      setIsLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success('Profile updated');
        setEditing(false);
        const d = await res.json();
        setProfile(prev => ({ ...prev, ...d.user }));
      }
    } catch { toast.error('Update failed'); }
    setSaving(false);
  };

  if (!user) return null;
  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const roleColors: Record<string, string> = {
    STUDENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    ORGANIZER: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    FACULTY: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
    ADMIN: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold">{user.name}</h1>
                  <Badge className={`text-xs ${roleColors[user.role]}`}>{user.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-3 mt-3">
                  <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                    <Edit3 className="w-3 h-3 mr-1" /> {editing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Edit Profile</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Department</Label>
                  <Input value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className="h-9" />
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
                  <Save className="w-3 h-3 mr-1" /> {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Profile Details */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Building2, label: 'Department', value: profile?.department || user.department || '-' },
              { icon: Hash, label: 'USN', value: profile?.usn || user.usn || '-' },
              { icon: Phone, label: 'Phone', value: profile?.phone || user.phone || '-' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground w-24 shrink-0">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stats */}
        {profile && (
          <Card>
            <CardHeader><CardTitle className="text-base">Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile._count?.registrations || 0}</p>
                  <p className="text-xs text-muted-foreground">Registrations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile._count?.attendances || 0}</p>
                  <p className="text-xs text-muted-foreground">Check-ins</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile._count?.organizedEvents || 0}</p>
                  <p className="text-xs text-muted-foreground">Organized</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Club Memberships */}
        {profile?.clubMemberships && profile.clubMemberships.length > 0 && (
          <Card className="mt-6">
            <CardHeader><CardTitle className="text-base">Club Memberships</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {profile.clubMemberships.map((cm: any) => (
                <div key={cm.id} className="flex items-center justify-between py-1.5">
                  <span className="text-sm font-medium">{cm.club.name}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{cm.role}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
