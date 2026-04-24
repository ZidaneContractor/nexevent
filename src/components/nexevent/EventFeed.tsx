'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useEventStore, EventCategory } from '@/store/event-store';
import {
  Calendar, MapPin, Clock, Users, Filter, Search,
  ChevronDown, Sparkles, Zap, Heart, Star, ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const categoryColors: Record<string, string> = {
  HACKATHON: 'from-violet-500 to-purple-600',
  TECHNICAL: 'from-cyan-500 to-blue-600',
  CULTURAL: 'from-rose-500 to-pink-600',
  WORKSHOP: 'from-amber-500 to-orange-600',
  SEMINAR: 'from-emerald-500 to-teal-600',
  SPORTS: 'from-green-500 to-lime-600',
  SOCIAL: 'from-fuchsia-500 to-purple-600',
  OTHER: 'from-gray-500 to-gray-600',
};

const categoryIcons: Record<string, string> = {
  HACKATHON: '💻', TECHNICAL: '⚡', CULTURAL: '🎭', WORKSHOP: '🔧',
  SEMINAR: '🎓', SPORTS: '🏆', SOCIAL: '🌱', OTHER: '📌',
};

const statusColors: Record<string, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  LIVE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(d: string | Date) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function isUpcoming(d: string | Date) {
  return new Date(d) >= new Date();
}

export function EventFeed() {
  const { user } = useAuthStore();
  const { navigate, searchQuery } = useUIStore();
  const { events, filters, isLoading, fetchEvents, setFilters, clearFilters, registerForEvent } = useEventStore();
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const categories: EventCategory[] = ['TECHNICAL', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'SEMINAR', 'HACKATHON', 'SOCIAL', 'OTHER'];

  const filtered = useMemo(() => {
    let result = events;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.tags?.toLowerCase().includes(q)
      );
    }
    if (filters.category) result = result.filter(e => e.category === filters.category);
    return result;
  }, [events, searchQuery, filters.category]);

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    try {
      await registerForEvent(eventId);
    } catch {}
    setRegistering(null);
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campus Events</h1>
          <p className="text-sm text-muted-foreground">Discover and register for events at VVCE</p>
        </div>
        {(user?.role === 'ORGANIZER' || user?.role === 'FACULTY' || user?.role === 'ADMIN') && (
          <Button onClick={() => navigate('create-event')} className="bg-primary hover:bg-primary/90">
            <Zap className="w-4 h-4 mr-2" /> Create Event
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Select value={filters.category || 'all'} onValueChange={(v) => setFilters({ category: v === 'all' ? null : v as EventCategory })}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{categoryIcons[c]} {c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm"
          className={filters.upcoming ? 'bg-primary/10 text-primary border-primary/30' : ''}
          onClick={() => setFilters({ upcoming: !filters.upcoming })}>
          <Clock className="w-3 h-3 mr-1" /> Upcoming
        </Button>
        {filters.category && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} events</span>
      </div>

      {/* Event Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No events found</p>
          <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                <Card
                  className="group cursor-pointer hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden"
                  onClick={() => navigate('event-detail', event.id)}
                >
                  {/* Gradient top bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${categoryColors[event.category] || categoryColors.OTHER}`} />

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryIcons[event.category] || '📌'}</span>
                        <Badge variant="secondary" className={`text-[10px] ${statusColors[event.status]}`}>
                          {event.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 animate-pulse" />}
                          {event.status}
                        </Badge>
                      </div>
                      {(event as any).userRegistration && (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          Registered
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{event.description}</p>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{formatDate(event.startDate)} • {formatTime(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>{event._count?.registrations || 0} registered{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                      {event.club && (
                        <Badge variant="outline" className="text-[10px]">{event.club.name}</Badge>
                      )}
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
