'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Play, Calendar, Globe, AlertTriangle, ShieldCheck, 
  RotateCw, Loader2, ArrowRight, Ban, Search, CheckCircle2, History 
} from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface TestRun {
  id: number;
  website_id: number;
  status: string; // pending, running, completed, failed
  progress: number;
  started_at: string;
  completed_at?: string;
  report?: {
    id: number;
  };
}

interface Website {
  id: number;
  name: string;
  url: string;
}

export default function TestRunsPage() {
  return (
    <ErrorBoundary>
      <TestRunsContent />
    </ErrorBoundary>
  );
}

function TestRunsContent() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch Websites to map website_id -> website name & URL
  const { data: websites } = useQuery<Website[]>({
    queryKey: ['websites'],
    queryFn: async () => {
      const response = await api.get('/websites/');
      return response.data;
    },
  });

  const websitesMap = useMemo(() => {
    const map = new Map<number, Website>();
    websites?.forEach(w => map.set(w.id, w));
    return map;
  }, [websites]);

  // Fetch all Test Runs
  // If any test runs are currently running or pending, poll every 3 seconds to update progress
  const { data: testRuns, isLoading, refetch } = useQuery<TestRun[]>({
    queryKey: ['test-runs'],
    queryFn: async () => {
      const response = await api.get('/tests/');
      return response.data;
    },
    refetchInterval: (query) => {
      const runs = query.state.data as TestRun[] | undefined;
      const hasActiveRuns = runs?.some(r => r.status === 'running' || r.status === 'pending');
      return hasActiveRuns ? 3000 : false; // Poll every 3s if active runs exist
    }
  });

  // Rerun Test Mutation
  const rerunTestMutation = useMutation({
    mutationFn: async (websiteId: number) => {
      await api.post(`/tests/${websiteId}/run`);
    },
    onSuccess: () => {
      toast.success('Test run triggered successfully.');
      queryClient.invalidateQueries({ queryKey: ['test-runs'] });
    },
    onError: () => {
      toast.error('Failed to trigger test run.');
    }
  });

  const handleRerun = (websiteId: number) => {
    rerunTestMutation.mutate(websiteId);
  };

  // Filter test runs
  const filteredRuns = useMemo(() => {
    if (!testRuns) return [];
    return testRuns.filter(run => {
      const website = websitesMap.get(run.website_id);
      const matchesSearch = website 
        ? website.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          website.url.toLowerCase().includes(searchTerm.toLowerCase())
        : false;
      const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [testRuns, websitesMap, searchTerm, statusFilter]);

  // Format Duration helper
  const getDuration = (run: TestRun) => {
    if (!run.completed_at) return null;
    const start = new Date(run.started_at).getTime();
    const end = new Date(run.completed_at).getTime();
    const seconds = Math.floor((end - start) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Runs</h1>
          <p className="text-muted-foreground mt-1">Monitor the execution, status, and health results of website test runs.</p>
        </div>
        <button
          onClick={() => {
            refetch();
            toast.success('Refreshing test runs...');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold hover:bg-accent text-foreground transition active:scale-95 cursor-pointer shadow-sm"
        >
          <RotateCw size={14} />
          Refresh Status
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search test runs by website..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-border bg-card rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition text-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'completed', 'running', 'failed', 'pending'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase transition cursor-pointer ${
                statusFilter === filter
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="border border-border bg-card rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/20">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-9 w-28 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {filteredRuns.length === 0 ? (
            <EmptyState
              title="No Test Runs Found"
              description={
                searchTerm || statusFilter !== 'all'
                  ? "Try resetting your search query or filters."
                  : "Trigger your first test from the websites page."
              }
              icon={History}
              action={
                searchTerm || statusFilter !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    href="/websites"
                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-sm shadow-primary/20 hover:opacity-90 transition inline-flex items-center gap-2"
                  >
                    <Play size={16} />
                    Go to Websites
                  </Link>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Website</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Started</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status & Progress</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRuns.map((run) => {
                    const website = websitesMap.get(run.website_id);
                    const duration = getDuration(run);
                    
                    return (
                      <tr key={run.id} className="hover:bg-accent/40 transition">
                        {/* Website Details */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-muted rounded-xl text-muted-foreground border border-border">
                              <Globe size={18} />
                            </div>
                            <div className="max-w-[240px] truncate">
                              <p className="font-bold text-foreground truncate">{website?.name || `Website ID: ${run.website_id}`}</p>
                              <p className="text-xs text-muted-foreground truncate">{website?.url || 'URL unknown'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Started Time */}
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(run.started_at).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>

                        {/* Test Duration */}
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-foreground">
                          {run.status === 'running' && (
                            <span className="text-primary flex items-center gap-1.5">
                              <Loader2 size={14} className="animate-spin" />
                              Running...
                            </span>
                          )}
                          {run.status === 'pending' && <span className="text-muted-foreground">Pending</span>}
                          {run.status === 'completed' && (duration || 'N/A')}
                          {run.status === 'failed' && <span className="text-destructive">Failed</span>}
                        </td>

                        {/* Status Bar / Progress */}
                        <td className="px-6 py-5">
                          <div className="max-w-xs space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase border ${
                                run.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-600' :
                                run.status === 'running' ? 'bg-primary/10 border-primary/20 text-primary animate-pulse' :
                                run.status === 'failed' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                                'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'
                              }`}>
                                {run.status}
                              </span>
                              {run.status === 'running' && (
                                <span className="text-xs font-bold text-primary">{run.progress}%</span>
                              )}
                            </div>
                            {(run.status === 'running' || run.status === 'pending') && (
                              <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border">
                                <div 
                                  className="bg-primary h-full transition-all duration-300 rounded-full"
                                  style={{ width: `${run.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-5 text-right whitespace-nowrap">
                          {run.status === 'completed' && run.report ? (
                            <Link
                              href={`/reports/${run.report.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/10 text-xs font-bold rounded-xl transition-all"
                            >
                              View Report
                              <ArrowRight size={12} />
                            </Link>
                          ) : run.status === 'failed' ? (
                            <button
                              onClick={() => handleRerun(run.website_id)}
                              disabled={rerunTestMutation.isPending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/5 hover:bg-destructive text-destructive hover:text-white border border-destructive/10 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            >
                              <RotateCw size={12} />
                              Re-run
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold italic">Processing...</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
