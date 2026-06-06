'use client';

import Link from 'next/link';
import { 
  Rocket, ShieldCheck, Zap, BarChart3, ArrowRight, CheckCircle2, Terminal, Cpu 
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { CTA } from '@/components/marketing/cta';

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">
          <LandingContent />
          <FeaturesContent />
          <AboutContent />
          <CTA />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

function LandingContent() {
  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center py-12 md:py-24 overflow-hidden animate-in fade-in duration-500">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none select-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[80px] pointer-events-none select-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 text-center space-y-12 relative">
        
        {/* Banner Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-bold animate-pulse mx-auto">
          <Zap size={12} />
          <span>v1.2.0 Now Active</span>
        </div>

        {/* Hero Copy */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-[1.05] text-foreground">
            Automate Quality Assurance with{' '}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              TestPilot
            </span>
          </h1>
          <p className="text-lg sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            TestPilot crawls your platforms, detects regressions, and produces AI-driven reports in seconds.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-10 py-5 text-base font-black text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            Start Free Trial
            <ArrowRight size={18} />
          </Link>
          <Link 
            href="/pricing" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-10 py-5 text-base font-black text-foreground shadow-sm transition-all hover:bg-muted active:scale-95"
          >
            View Pricing
          </Link>
        </div>

        {/* Floating UI Preview Placeholder */}
        <div className="pt-20 max-w-5xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="aspect-[16/9] bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="flex-1 grid grid-cols-12 gap-6">
                  <div className="col-span-3 space-y-4">
                    <div className="h-8 bg-muted rounded-xl w-3/4 animate-pulse" />
                    <div className="h-6 bg-muted rounded-xl w-full animate-pulse delay-75" />
                    <div className="h-6 bg-muted rounded-xl w-5/6 animate-pulse delay-150" />
                  </div>
                  <div className="col-span-9 bg-muted/30 rounded-3xl border border-border/50 p-6 flex items-center justify-center">
                    <Cpu size={48} className="text-primary/20 animate-spin-slow" />
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesContent() {
  const features = [
    {
      title: 'Automated Crawling',
      description: 'Recursively parse pages and extract health indicators, dead links, and semantic metadata instantly.',
      icon: Terminal,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'AI Diagnostic Reports',
      description: 'Get deep executive summaries, recommendations, and issue logs compiled by our AI engine.',
      icon: Cpu,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Performance Audits',
      description: 'Observe load metrics, assets efficiency, and overall reliability indices from one view.',
      icon: BarChart3,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      title: 'Continuous Monitoring',
      description: 'Schedule recurring tests to track code regressions and quality drops before your users do.',
      icon: ShieldCheck,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    }
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-primary font-bold tracking-widest uppercase text-xs">Features</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Everything you need for perfect web quality
          </h3>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            TestPilot combines traditional QA methodologies with modern AI to provide a comprehensive look at your site's health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 text-left">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="group p-8 border border-border bg-card text-foreground rounded-[2.5rem] shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 flex flex-col sm:flex-row gap-6"
            >
              <div className={`p-4 h-fit w-fit rounded-2xl border border-border/20 ${feature.bg} ${feature.color} shrink-0 shadow-inner`}>
                <feature.icon size={28} />
              </div>
              <div className="space-y-3">
                <h3 className="font-black text-2xl text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutContent() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <h2 className="text-primary font-bold tracking-widest uppercase text-xs">About Us</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
              Built by developers, for developers
            </h3>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed">
            <p>
              We believe that manual QA is a bottleneck that shouldn't exist in modern software development. TestPilot was born out of the frustration of shipping code and realizing hours later that an edge case broke.
            </p>
            <p>
              Our mission is to provide every team with the tools they need to ensure their web platforms are performant, accessible, and bug-free without slowing down their release cycle.
            </p>
          </div>
          <div className="flex items-center gap-8 pt-4">
            <div className="space-y-1">
              <p className="text-3xl font-black text-foreground">500k+</p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tests Run</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="space-y-1">
              <p className="text-3xl font-black text-foreground">99.9%</p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Reliability</p>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full max-w-lg lg:max-w-none">
          <div className="aspect-square bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-[3rem] border border-border flex items-center justify-center relative p-12 overflow-hidden shadow-inner">
            <Rocket size={120} className="text-primary animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-grid-white/[0.02] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
