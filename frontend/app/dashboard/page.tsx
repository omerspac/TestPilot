'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Globe, Rocket, AlertCircle, ShieldAlert } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface AnalyticsData {
  stats: {
    total_websites: number;
    total_test_runs: number;
    total_issues: number;
    critical_issues: number;
  };
  charts: {
    issues_over_time: Array<{ date: string; count: number }>;
    severity_distribution: Array<{ name: string; value: number }>;
  };
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6']; // Critical, High, Medium, Low

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const response = await api.get('/analytics/summary');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        
        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border border-border p-6 rounded-3xl space-y-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-4 w-64 rounded-md" />
            </div>
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-4 w-64 rounded-md" />
            </div>
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Websites', value: data?.stats.total_websites ?? 0, icon: Globe, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10 dark:bg-blue-500/20' },
    { label: 'Total Test Runs', value: data?.stats.total_test_runs ?? 0, icon: Rocket, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10 dark:bg-purple-500/20' },
    { label: 'Issues Found', value: data?.stats.total_issues ?? 0, icon: AlertCircle, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/10 dark:bg-orange-500/20' },
    { label: 'Critical Issues', value: data?.stats.critical_issues ?? 0, icon: ShieldAlert, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10 dark:bg-red-500/20' },
  ];

  const hasChartData = data?.charts?.issues_over_time?.length && data?.charts?.severity_distribution?.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time health and performance metrics for all your websites.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div 
            key={kpi.label} 
            className="bg-card text-foreground p-6 rounded-3xl border border-border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl border border-border/20 ${kpi.bg}`}>
                <kpi.icon className={kpi.color} size={20} />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-semibold">{kpi.label}</p>
              <h3 className="text-3xl font-black tracking-tight mt-1">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State when no metrics exist */}
      {!hasChartData ? (
        <EmptyState
          title="No Analytics Data Available"
          description="Register websites and run automated tests to compile dashboard insights."
          icon={Rocket}
          action={
            <a 
              href="/websites" 
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow shadow-primary/20 transition hover:opacity-90"
            >
              Configure Websites
            </a>
          }
        />
      ) : (
        /* Charts Section */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Issues Over Time Chart */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm lg:col-span-7 flex flex-col justify-between">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground">Issues Detected (Last 7 Days)</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Volume of issues discovered across all crawl jobs.</p>
            </div>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.charts.issues_over_time}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-50" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: '500'}}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {weekday: 'short'})}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: '500'}} 
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      color: 'var(--foreground)'
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  />
                  <Area type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Severity Distribution Chart */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm lg:col-span-5 flex flex-col justify-between">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground">Severity Distribution</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Breakdown of issues by impact on site health.</p>
            </div>
            <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-around gap-6">
              <div className="relative w-44 h-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.charts.severity_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data?.charts.severity_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-card stroke-2" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: 'var(--foreground)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
                  <span className="text-2xl font-black text-foreground">
                    {data?.charts.severity_distribution.reduce((acc, c) => acc + c.value, 0) ?? 0}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2.5 w-full sm:w-auto">
                {data?.charts.severity_distribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between sm:justify-start gap-4 p-2 bg-muted/20 border border-border/40 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{entry.name}</span>
                    </div>
                    <span className="text-xs font-black text-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
