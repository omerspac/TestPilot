'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileText, Search, Filter, ChevronRight, Calendar, Globe, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportListItem {
  id: number;
  summary: string;
  website_name: string;
  website_url: string;
  status: string;
  started_at: string;
  health_score?: number;
}

export default function ReportsPage() {
  return (
    <ErrorBoundary>
      <ReportsContent />
    </ErrorBoundary>
  );
}

function ReportsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reports, isLoading } = useQuery<ReportListItem[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await api.get('/reports/');
      return response.data;
    },
  });

  const filteredReports = reports?.filter(r => 
    r.website_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Reports</h1>
        <p className="text-muted-foreground mt-1 font-medium">Access all AI-generated quality reports for your websites.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search reports by website or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-border bg-card text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition text-sm font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:bg-accent text-foreground transition font-semibold text-sm cursor-pointer shadow-sm">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-card border border-border rounded-2xl flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {filteredReports && filteredReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Website</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Score</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredReports.map((report) => (
                    <tr 
                      key={report.id} 
                      className="hover:bg-accent/40 transition group cursor-pointer" 
                      onClick={() => router.push(`/reports/${report.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-muted rounded-xl text-muted-foreground border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                            <Globe size={18} />
                          </div>
                          <div className="max-w-[240px] truncate">
                            <p className="font-bold text-foreground truncate">{report.website_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{report.website_url}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                          <Calendar size={14} />
                          {new Date(report.started_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase border ${
                          report.status === 'completed' 
                            ? 'bg-green-500/10 border-green-500/20 text-green-600' 
                            : 'bg-muted border-border text-muted-foreground'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 font-bold text-foreground">
                          <ShieldCheck size={16} className={report.health_score && report.health_score > 80 ? "text-green-500" : "text-yellow-500"} />
                          {report.health_score || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/reports/${report.id}`} 
                          className="text-muted-foreground group-hover:text-foreground transition inline-block p-1 hover:bg-muted rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="View report details"
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No Reports Found"
              description={
                searchTerm 
                  ? "No audit records match your search criteria. Try a different query."
                  : "Start crawling your websites to generate AI audit reports."
              }
              icon={FileText}
              action={
                searchTerm ? (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition"
                  >
                    Clear Search
                  </button>
                ) : (
                  <Link
                    href="/websites"
                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-sm shadow-primary/20 hover:opacity-90 transition inline-flex items-center gap-1.5"
                  >
                    Go to Websites
                  </Link>
                )
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
