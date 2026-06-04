'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  ArrowLeft, Calendar, Globe, ShieldCheck, AlertTriangle, 
  CheckCircle, Zap, Cpu, Layout, FileSearch, Loader2, Copy 
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportDetail {
  id: number;
  summary: string;
  ai_analysis: {
    summary: string;
    critical_issues: string[];
    medium_issues: string[];
    recommendations: string[];
    health_score: number;
  };
  website: {
    name: string;
    url: string;
  };
  test_run: {
    id: number;
    status: string;
    started_at: string;
    completed_at: string;
    metrics: any;
  };
  issues: Array<{
    id: number;
    title: string;
    description: string;
    severity: string;
    category: string;
    page_url: string;
  }>;
}

export default function ReportDetailPage() {
  return (
    <ErrorBoundary>
      <ReportDetailContent />
    </ErrorBoundary>
  );
}

function ReportDetailContent() {
  const { id } = useParams();

  const { data: report, isLoading, error } = useQuery<ReportDetail>({
    queryKey: ['report', id],
    queryFn: async () => {
      const response = await api.get(`/reports/${id}`);
      return response.data;
    },
  });

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report URL copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
        <Skeleton className="h-6 w-32 rounded-lg" />
        
        {/* Header Skeleton */}
        <div className="bg-card border border-border rounded-3xl p-8 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-6">
            <Skeleton className="w-20 h-20 rounded-2xl" />
            <div className="space-y-2.5">
              <Skeleton className="h-8 w-60 rounded-md" />
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
            </div>
          </div>
          <Skeleton className="w-36 h-24 rounded-2xl shrink-0" />
        </div>

        {/* Content Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-3xl p-8 space-y-4">
              <Skeleton className="h-7 w-48 rounded-md" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
            <div className="bg-card border border-border rounded-3xl p-8 space-y-4">
              <Skeleton className="h-7 w-48 rounded-md" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-20 animate-in fade-in duration-300 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4 border border-destructive/20">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Report Not Found</h2>
        <p className="text-muted-foreground mt-2 text-sm">The requested quality report could not be located. It may have been deleted or the ID is incorrect.</p>
        <Link href="/reports" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm transition active:scale-95 shadow-sm shadow-primary/20 hover:opacity-90">
          <ArrowLeft size={16} />
          Back to Reports
        </Link>
      </div>
    );
  }

  const { ai_analysis: ai } = report;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <Link href="/reports" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition font-semibold text-sm group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Reports
      </Link>

      {/* Header Section */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center border border-primary/20 shadow-inner">
            <Globe size={36} />
          </div>
          <div className="max-w-md md:max-w-lg truncate">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground truncate">{report.website.name}</h1>
            <p className="text-muted-foreground font-semibold text-sm truncate mt-0.5">{report.website.url}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Calendar size={13} />
                {new Date(report.test_run.started_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Zap size={13} className="text-yellow-500" />
                {report.issues.length} Issues Found
              </span>
            </div>
          </div>
        </div>
        
        {/* Health Score Shield */}
        <div className="flex flex-col items-center gap-1 bg-muted/30 px-8 py-4 rounded-2xl border border-border shrink-0 self-stretch md:self-auto justify-center">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Health Score</span>
          <div className="text-5xl font-black text-foreground">{ai.health_score}</div>
          <div className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide border mt-1 ${
            ai.health_score > 80 ? 'bg-green-500/10 border-green-500/20 text-green-600' : 
            ai.health_score > 50 ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' : 
            'bg-destructive/10 border-destructive/20 text-destructive'
          }`}>
            {ai.health_score > 80 ? 'Good' : ai.health_score > 50 ? 'Needs Work' : 'Critical'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: AI Analysis */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl">
                <Cpu size={20} />
              </div>
              <h2 className="text-lg font-bold text-foreground">AI Executive Summary</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-base italic font-medium bg-muted/20 p-5 rounded-2xl border border-border/50">
              "{ai.summary}"
            </p>
          </section>

          {ai.critical_issues.length > 0 && (
            <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-lg font-bold text-foreground">Critical Findings</h2>
              </div>
              <ul className="space-y-4">
                {ai.critical_issues.map((issue, i) => (
                  <li key={i} className="flex gap-3 text-muted-foreground text-sm font-medium">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl">
                <CheckCircle size={20} />
              </div>
              <h2 className="text-lg font-bold text-foreground">AI Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ai.recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-muted/25 rounded-2xl border border-border/70 text-xs font-semibold text-muted-foreground leading-relaxed">
                  {rec}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Detailed Issues List */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold flex items-center gap-2 text-foreground text-base">
                <Layout size={18} className="text-muted-foreground" />
                Raw Issue Log
              </h2>
              <span className="text-[10px] font-black bg-muted border border-border px-2 py-0.5 rounded-md text-foreground">{report.issues.length}</span>
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {report.issues.map((issue) => (
                <div key={issue.id} className="p-4 border border-border bg-muted/10 rounded-2xl hover:border-border/80 hover:bg-muted/20 transition-all duration-200 group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase border ${
                      issue.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-600' :
                      issue.severity === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' :
                      issue.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-600'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{issue.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{issue.description}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono bg-muted border border-border/50 p-2 rounded-xl truncate">
                    <FileSearch size={10} className="shrink-0" />
                    <span className="truncate" title={issue.page_url}>{issue.page_url}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Report Widget */}
          <div className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-md shadow-primary/20 space-y-4">
            <div>
              <h3 className="font-bold text-lg">Share Audit Report</h3>
              <p className="text-primary-foreground/70 text-xs mt-1 leading-relaxed">
                Provide a quick link for developers or QA staff to view these AI audit logs directly.
              </p>
            </div>
            <button 
              onClick={handleCopyLink}
              className="w-full py-3 bg-primary-foreground text-primary font-bold text-xs rounded-2xl hover:opacity-95 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-black/10"
            >
              <Copy size={13} />
              Copy Report URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
