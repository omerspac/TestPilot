'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import { Trash2, Edit, Plus, Globe, ExternalLink, X, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import Link from 'next/link';

interface Website {
  id: number;
  name: string;
  url: string;
  created_at: string;
}

export default function WebsitesPage() {
  return (
    <ErrorBoundary>
      <WebsitesContent />
    </ErrorBoundary>
  );
}

function WebsitesContent() {
  const queryClient = useQueryClient();
  
  // Modals / Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Website | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '' });

  // Fetch Websites
  const { data: websites, isLoading } = useQuery<Website[]>({
    queryKey: ['websites'],
    queryFn: async () => {
      const response = await api.get('/websites/');
      return response.data;
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; url: string }) => {
      const response = await api.post('/websites/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      toast.success('Website added successfully.');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to create website.');
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; url: string }) => {
      const response = await api.put(`/websites/${data.id}`, { name: data.name, url: data.url });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      toast.success('Website details updated.');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update website.');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/websites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      toast.success('Website and all associated audit histories deleted.');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to delete website.');
      setDeleteTarget(null);
    }
  });

  // Run Test Mutation
  const runTestMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/tests/${id}/run`);
    },
    onSuccess: () => {
      toast.success('Test run queued in the background. Check Test Runs for updates.');
      queryClient.invalidateQueries({ queryKey: ['test-runs'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to queue test run.');
    }
  });

  const handleRunTest = (id: number) => {
    runTestMutation.mutate(id);
  };

  const openAddModal = () => {
    setEditingWebsite(null);
    setFormData({ name: '', url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (website: Website) => {
    setEditingWebsite(website);
    setFormData({ name: website.name, url: website.url });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWebsite(null);
    setFormData({ name: '', url: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWebsite) {
      updateMutation.mutate({ id: editingWebsite.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Websites</h1>
          <p className="text-muted-foreground mt-1">Manage the websites you want to test and monitor with TestPilot.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition active:scale-95 shadow-sm shadow-primary/20 cursor-pointer"
        >
          <Plus size={18} />
          Add Website
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="pt-4 border-t border-border flex gap-3">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 flex-1 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites?.map((site) => (
            <div 
              key={site.id} 
              className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary border border-border/80 transition-all duration-200">
                    <Globe size={22} />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => openEditModal(site)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition cursor-pointer"
                      aria-label={`Edit ${site.name}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteTarget(site)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition cursor-pointer"
                      aria-label={`Delete ${site.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1 truncate text-foreground">{site.name}</h3>
                <a 
                  href={site.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-xs flex items-center gap-1 hover:text-primary transition truncate mb-6 w-fit"
                >
                  {site.url}
                  <ExternalLink size={12} className="shrink-0" />
                </a>
              </div>
              
              <div className="pt-4 border-t border-border flex gap-3">
                <button 
                  onClick={() => handleRunTest(site.id)}
                  disabled={runTestMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-xs font-bold hover:opacity-95 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm shadow-primary/10"
                >
                  {runTestMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'Run Test'
                  )}
                </button>
                <Link 
                  href={`/test-runs`} 
                  className="flex-1 bg-card border border-border py-2.5 rounded-xl text-xs font-bold hover:bg-accent text-foreground transition text-center flex items-center justify-center"
                >
                  History
                </Link>
              </div>
            </div>
          ))}

          {websites?.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                title="No Websites Added Yet"
                description="Add your first website or software portal to start auditing performance, security, and accessibility metrics."
                icon={Globe}
                action={
                  <button 
                    onClick={openAddModal}
                    className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition active:scale-95 shadow-sm cursor-pointer"
                  >
                    <Plus size={18} />
                    Register Website
                  </button>
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      <Dialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        title="Delete Website"
        description={`Are you sure you want to delete ${deleteTarget?.name}? All associated automated crawl logs, test histories, and AI recommendations will be permanently removed. This action cannot be undone.`}
        confirmText="Permanently Delete"
        cancelText="Cancel"
        variant="danger"
        isPending={deleteMutation.isPending}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-card text-foreground rounded-3xl w-full max-w-md shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 id="modal-title" className="text-xl font-bold tracking-tight">
                {editingWebsite ? 'Edit Website Details' : 'Register New Website'}
              </h2>
              <button 
                onClick={closeModal} 
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-foreground">Display Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Platform Name"
                  className="w-full p-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-foreground">Website URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full p-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
              
              <div className="pt-4 border-t border-border flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-muted/50 border border-border text-foreground font-bold text-sm rounded-xl hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:opacity-90 transition disabled:opacity-75 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-primary/10"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : (editingWebsite ? 'Save Changes' : 'Register Website')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
