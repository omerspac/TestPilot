import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { CTA } from '@/components/marketing/cta';

const plans = [
  {
    name: 'Starter',
    price: '$19',
    description: 'Perfect for small projects and individual developers.',
    features: [
      'Monitor up to 5 websites',
      'Weekly automated scans',
      'Basic issue detection',
      'Email notifications',
      'Community support',
    ],
    buttonText: 'Get Started',
    href: '/register',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$49',
    description: 'The standard for growing teams and serious websites.',
    features: [
      'Monitor up to 25 websites',
      'Daily automated scans',
      'AI-generated reports',
      'Historical analytics',
      'Priority support',
      'Advanced accessibility checks',
      'SEO optimization tips',
    ],
    buttonText: 'Get Started',
    href: '/register',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Tailored solutions for large organizations.',
    features: [
      'Unlimited websites',
      'Team collaboration',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'Custom AI model training',
      'White-label reports',
    ],
    buttonText: 'Contact Sales',
    href: '/#contact',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-20">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-primary font-bold tracking-widest uppercase text-xs">Pricing Plans</h2>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
              Simple Pricing for Every Team
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Choose the plan that fits your website monitoring needs. No hidden fees, cancel anytime.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-[2.5rem] border transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-8 duration-500 delay-${i * 100} ${
                  plan.popular
                    ? 'bg-card border-primary shadow-2xl shadow-primary/10 scale-105 z-10'
                    : 'bg-card/50 border-border shadow-sm hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <Star size={12} fill="currentColor" />
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-black text-foreground">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-black text-foreground">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-muted-foreground font-bold">/month</span>}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground font-medium leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="mt-1 bg-primary/10 text-primary p-0.5 rounded-full shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="text-sm font-semibold text-foreground/80 leading-tight">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.href}
                  className={`w-full py-4 px-6 rounded-2xl text-center font-black text-sm transition-all active:scale-[0.98] flex items-center justify-center shadow-lg ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground shadow-primary/25 hover:opacity-90'
                      : 'bg-muted text-foreground shadow-sm hover:bg-accent'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Preview or Secondary CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-muted/20 mt-12">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Need a custom plan?</h3>
            <p className="text-muted-foreground font-medium mb-8">
              We offer volume discounts and custom enterprise packages. Let's build a plan that works for you.
            </p>
            <Link href="/#contact" className="text-primary font-black flex items-center justify-center gap-2 hover:underline">
              Contact our sales team
              <Check size={16} />
            </Link>
          </div>
        </section>

        <CTA />
      </main>

      <Footer />
    </div>
  );
}
