import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Start Improving Website Quality Today
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
          Detect issues before your users do. Automate your QA process with AI and ship with confidence.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/25 flex items-center justify-center gap-2 group"
          >
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/#contact"
            className="w-full sm:w-auto px-8 py-4 bg-card border border-border text-foreground font-bold rounded-2xl text-lg transition-all hover:bg-muted active:scale-95 shadow-sm"
          >
            Book Demo
          </Link>
        </div>
        
        <p className="text-sm text-muted-foreground font-semibold">
          No credit card required • Free trial available
        </p>
      </div>
    </section>
  );
}
