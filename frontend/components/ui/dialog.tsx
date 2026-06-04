'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isPending?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isPending = false,
}: DialogProps) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Support ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Container */}
      <div 
        className="bg-card text-foreground rounded-3xl w-full max-w-md shadow-2xl border border-border overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
              variant === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
            }`}>
              {variant === 'danger' ? <AlertTriangle size={22} /> : <X size={22} />}
            </div>
            <button 
              onClick={onClose} 
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
          
          <h2 id="dialog-title" className="text-xl font-bold tracking-tight mb-2">
            {title}
          </h2>
          <p id="dialog-description" className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 bg-card hover:bg-accent text-foreground font-semibold text-sm rounded-xl border border-border transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2.5 text-white font-semibold text-sm rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
              variant === 'danger' 
                ? 'bg-destructive hover:bg-destructive/90 shadow-sm shadow-destructive/20' 
                : 'bg-primary hover:bg-primary/95 shadow-sm shadow-primary/20'
            }`}
          >
            {isPending ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
