'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { Providers } from "./providers";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Globe, Rocket, AlertCircle, Settings, FileText, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const isPublicRoute = ['/login', '/register', '/', '/pricing'].includes(pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="w-6 h-6 border-4 border-muted border-t-transparent rounded-full animate-spin [animation-direction:reverse]" />
        </div>
      </div>
    );
  }

  if (isPublicRoute) {
    return <main className="flex-1 min-h-screen bg-muted/30">{children}</main>;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Rocket },
    { href: "/websites", label: "Websites", icon: Globe },
    { href: "/test-runs", label: "Test Runs", icon: AlertCircle },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col sticky top-0 h-screen z-20">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-lg transition-transform group-hover:scale-105">
              T
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text">
              TestPilot
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5" role="navigation" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon size={18} className={`shrink-0 ${isActive ? '' : 'text-muted-foreground group-hover:text-foreground transition-colors'}`} />
                {item.label}
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border bg-muted/20">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Navigation Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] border-r border-border bg-card flex flex-col z-50 md:hidden transition-transform duration-300 ease-out transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
              T
            </div>
            <span className="text-xl font-bold tracking-tight">TestPilot</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border bg-muted/20">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-base font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition cursor-pointer"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-muted md:hidden text-muted-foreground hover:text-foreground transition cursor-pointer"
              aria-expanded={isMobileMenuOpen}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
                T
              </div>
              <span className="font-bold text-lg tracking-tight">TestPilot</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-foreground leading-none">{user?.full_name}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{user?.email}</span>
              </div>
              <div 
                className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-inner transition-transform hover:scale-105 select-none"
                title={`${user?.full_name} (${user?.email})`}
              >
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-4 md:p-8 bg-muted/10 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <Providers>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
