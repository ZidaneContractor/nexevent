'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useEventStore } from '@/store/event-store';
import {
  Zap, Calendar, Users, QrCode, FileText, ArrowRight,
  Sparkles, MapPin, Clock, CheckCircle2, Globe2, Leaf,
  Shield, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const { navigate, showLogin, showRegister } = useUIStore();
  const { fetchEvents } = useEventStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats?userId=demo').then(r => r.json()).then(d => setStats(d.stats)).catch(() => {});
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      fetchEvents();
      navigate('feed');
    } else {
      showRegister();
    }
  };

  const features = [
    { icon: Calendar, title: 'Unified Event Feed', desc: 'Every campus event in one live stream. No more scattered WhatsApp groups.', color: 'from-violet-500 to-purple-600' },
    { icon: QrCode, title: 'QR Check-in', desc: 'Secure, geo-fenced attendance. No proxy, no queues, no paper.', color: 'from-emerald-500 to-teal-600' },
    { icon: FileText, title: 'Auto Reports', desc: 'PDF participation reports generated instantly. 100% reduction in manual filing.', color: 'from-amber-500 to-orange-600' },
    { icon: Shield, title: 'Verified Profiles', desc: 'Authenticated @vvce.ac.in identities. Faculty-approved events.', color: 'from-rose-500 to-pink-600' },
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboards for organizers and faculty. Track engagement instantly.', color: 'from-cyan-500 to-blue-600' },
    { icon: Globe2, title: 'Campus Agnostic', desc: 'Deploy at any university. Built to scale beyond VVCE.', color: 'from-fuchsia-500 to-purple-600' },
  ];

  const stats_display = [
    { value: stats?.totalEvents || '7+', label: 'Events', icon: Calendar },
    { value: stats?.totalClubs || '5', label: 'Clubs', icon: Users },
    { value: '3-5h', label: 'Saved per Event', icon: Clock },
    { value: '0', label: 'Paper Registers', icon: Leaf },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4">
        {/* Background effects */}
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-chart-4/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Campus Innovation 2026 • Team Jungly Billi
            </Badge>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Every Campus Event.
            <br />
            <span className="bg-gradient-to-r from-primary via-chart-4 to-chart-2 bg-clip-text text-transparent animate-gradient">
              One Platform.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            NexEvent replaces scattered WhatsApp groups, paper registers, and manual reports with
            a unified digital ecosystem for VVCE.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={handleGetStarted}
              className="h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90 group">
              Explore Events
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => {
              if (!isAuthenticated) showLogin();
              else navigate('feed');
            }} className="h-12 px-8 text-base">
              Sign In to Register
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
            {stats_display.map((s, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <s.icon className="w-4 h-4 text-primary mr-1.5" />
                  <span className="text-2xl font-bold">{s.value}</span>
                </div>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Built for Campus Life</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              From discovery to reporting — NexEvent handles the entire event lifecycle.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Simple. Fast. Paperless.</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Calendar, title: 'Create Event', desc: 'Organizer submits event for faculty approval' },
              { step: '02', icon: CheckCircle2, title: 'Get Approved', desc: 'Faculty reviews and approves with one click' },
              { step: '03', icon: QrCode, title: 'Register & Check-in', desc: 'Students register, scan QR at venue with geo-fence' },
              { step: '04', icon: FileText, title: 'Auto Report', desc: 'PDF reports generated instantly — no manual work' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative">
                  <s.icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-chart-4/10 border border-primary/20 p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3">Ready to Go Digital?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join NexEvent and never miss a campus event again. Registration is free — all you need is your @vvce.ac.in email.
            </p>
            <Button size="lg" onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
              Get Started Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
