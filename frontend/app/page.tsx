'use client';

import Link from 'next/link';
import { 
  Rocket, ShieldCheck, Zap, BarChart3, ArrowRight, CheckCircle2, Terminal, Cpu 
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <LandingContent />
    </ErrorBoundary>
  );
}

function LandingContent() {
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
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center py-12 md:py-24 overflow-hidden animate-in fade-in duration-500">
      
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
        <div className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-foreground from-foreground via-foreground to-foreground/80">
            Automate Quality Assurance with{' '}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              TestPilot
            </span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            TestPilot crawls your platforms, detects functional regressions, performs performance checks, and produces AI-driven reports in seconds.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:opacity-95 hover:translate-y-[-1px] active:translate-y-0"
          >
            Launch Console
            <ArrowRight size={16} />
          </Link>
          <Link 
            href="/test-runs" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-4 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-accent hover:text-foreground hover:translate-y-[-1px] active:translate-y-0"
          >
            View Latencies
          </Link>
        </div>

        {/* Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 text-left">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="group p-6 border border-border bg-card text-foreground rounded-3xl shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/80 flex gap-4"
            >
              <div className={`p-3 h-fit rounded-2xl border border-border/20 ${feature.bg} ${feature.color} shrink-0`}>
                <feature.icon size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
