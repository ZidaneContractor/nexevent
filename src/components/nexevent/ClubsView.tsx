'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useClubStore, Club } from '@/store/club-store';
import { Users, UserPlus, UserMinus, Loader2, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const categoryColors: Record<string, string> = {
  TECHNICAL: 'from-cyan-500 to-blue-600',
  CULTURAL: 'from-rose-500 to-pink-600',
  SPORTS: 'from-green-500 to-lime-600',
  SOCIAL: 'from-fuchsia-500 to-purple-600',
  OTHER: 'from-gray-500 to-gray-600',
};

export function ClubsView() {
  const { user, isAuthenticated } = useAuthStore();
  const { navigate } = useUIStore();
  const { clubs, isLoading, fetchClubs, joinClub, leaveClub } = useClubStore();
  const [expandedClub, setExpandedClub] = useState<string | null>(null);
  const [clubDetails, setClubDetails] = useState<Record<string, any>>({});

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  const loadClubDetail = async (id: string) => {
    if (clubDetails[id]) return;
    const res = await fetch(`/api/clubs/${id}`);
    if (res.ok) {
      const d = await res.json();
      setClubDetails(prev => ({ ...prev, [id]: d.club }));
    }
  };

  const handleJoin = async (clubId: string) => {
    try { await joinClub(clubId); toast.success('Joined club!'); }
    catch (e: any) { toast.error(e.message || 'Failed to join'); }
  };

  const handleLeave = async (clubId: string) => {
    try { await leaveClub(clubId); toast.success('Left club'); }
    catch (e: any) { toast.error(e.message || 'Failed to leave'); }
  };

  const isMember = (club: any) => user && club.members?.some((m: any) => m.userId === user.id);

  if (isLoading && clubs.length === 0) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Campus Clubs</h1>
        <p className="text-sm text-muted-foreground">Join clubs and discover their events</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club, i) => (
          <motion.div key={club.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${categoryColors[club.category] || categoryColors.OTHER}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base">{club.name}</h3>
                  <Badge variant="outline" className="text-[10px]">{club.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{club.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {club._count?.members || 0} members</span>
                  <span>{club._count?.events || 0} events</span>
                </div>

                {club.facultyAdvisor && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Advisor: {club.facultyAdvisor.name}
                  </p>
                )}

                {isAuthenticated && (
                  <div className="flex gap-2">
                    {isMember(club) ? (
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive text-xs"
                        onClick={() => handleLeave(club.id)}>
                        <UserMinus className="w-3 h-3 mr-1" /> Leave
                      </Button>
                    ) : (
                      <Button size="sm" className="text-xs bg-primary hover:bg-primary/90"
                        onClick={() => handleJoin(club.id)}>
                        <UserPlus className="w-3 h-3 mr-1" /> Join
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-xs"
                      onClick={() => { setExpandedClub(expandedClub === club.id ? null : club.id); loadClubDetail(club.id); }}>
                      {expandedClub === club.id ? 'Less' : 'Members'}
                    </Button>
                  </div>
                )}

                {expandedClub === club.id && clubDetails[club.id] && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-border/30 space-y-1.5 max-h-40 overflow-y-auto">
                    {clubDetails[club.id].members?.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between text-xs">
                        <span>{m.user.name}</span>
                        {m.role !== 'member' && (
                          <Badge variant="secondary" className="text-[10px]">
                            {m.role === 'president' && <Crown className="w-2.5 h-2.5 mr-0.5" />}
                            {m.role}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
