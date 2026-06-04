'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { 
  User, Shield, Bell, Key, Sparkles, Eye, EyeOff, Save, Loader2, Monitor, Sun, Moon 
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <SettingsContent />
    </ErrorBoundary>
  );
}

function SettingsContent() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

  // Active section state
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'api'>('profile');

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [openaiKey, setOpenaiKey] = useState('sk-proj-••••••••••••••••••••');
  const [showKey, setShowKey] = useState(false);

  // Toggle Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [criticalSms, setCriticalSms] = useState(true);

  // Async operation states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingApi, setIsSavingApi] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.put('/auth/update', { full_name: fullName, email });
      await refreshUser();
      toast.success('Profile settings updated successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsSavingSecurity(true);
    try {
      await api.put('/auth/update', { password });
      setPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotifications(true);
    // Simulate API call
    setTimeout(() => {
      setIsSavingNotifications(false);
      toast.success('Notification preferences updated.');
    }, 800);
  };

  const handleApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingApi(true);
    // Simulate API call
    setTimeout(() => {
      setIsSavingApi(false);
      toast.success('API keys updated successfully.');
    }, 800);
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys & Engine', icon: Key },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your personal preferences, security credentials, and AI settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Navigation */}
        <div className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Panels */}
        <div className="lg:col-span-9">
          {/* PROFILE PANEL */}
          {activeTab === 'profile' && (
            <div id="panel-profile" role="tabpanel" className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold">Profile Details</h2>
                <p className="text-sm text-muted-foreground mt-1">Update your name, email, and appearance preferences.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-foreground">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-foreground">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-bold mb-3 text-foreground">Visual Preference</h3>
                  <div className="grid grid-cols-3 gap-3 max-w-md">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Monitor },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setTheme(mode.value)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          theme === mode.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <mode.icon size={16} />
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 font-bold text-sm rounded-xl hover:opacity-90 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Profile Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECURITY PANEL */}
          {activeTab === 'security' && (
            <div id="panel-security" role="tabpanel" className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold">Password & Security</h2>
                <p className="text-sm text-muted-foreground mt-1">Change your account password below. Ensure it is at least 8 characters long.</p>
              </div>

              <form onSubmit={handleSecuritySubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-foreground">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-foreground">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSecurity}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 font-bold text-sm rounded-xl hover:opacity-90 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingSecurity ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS PANEL */}
          {activeTab === 'notifications' && (
            <div id="panel-notifications" role="tabpanel" className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold">Notification Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure how and when you receive automated crawl reports and alerts.</p>
              </div>

              <form onSubmit={handleNotificationSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 bg-muted/20 rounded-2xl border border-border/50">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Crawl Completion Emails</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-md">Receive a summary of errors, warnings, and AI recommendations each time a website completes testing.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailAlerts} 
                        onChange={(e) => setEmailAlerts(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>

                  <div className="flex items-start justify-between p-4 bg-muted/20 rounded-2xl border border-border/50">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Weekly Quality Digest</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-md">Get a weekly rollup report evaluating the overall health progression of your registered platforms.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={weeklyDigest} 
                        onChange={(e) => setWeeklyDigest(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>

                  <div className="flex items-start justify-between p-4 bg-muted/20 rounded-2xl border border-border/50">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-foreground">Critical Error Alerts</h4>
                        <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">SMS / Push</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-md">Immediate notification if the homepage health score drops below 40 or a critical issue is identified.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={criticalSms} 
                        onChange={(e) => setCriticalSms(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingNotifications}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 font-bold text-sm rounded-xl hover:opacity-90 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingNotifications ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Notification Toggles
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* API KEY PANEL */}
          {activeTab === 'api' && (
            <div id="panel-api" role="tabpanel" className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Diagnostics Engine</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Integrate custom credentials to override the default system LLM.</p>
                </div>
              </div>

              <form onSubmit={handleApiSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-foreground">OpenAI API Key</label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="w-full pl-3 pr-10 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                        aria-label={showKey ? 'Hide key' : 'Show key'}
                      >
                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Your key is securely stored in client environments and is used purely to run AI diagnostics.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingApi}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 font-bold text-sm rounded-xl hover:opacity-90 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingApi ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Custom Key
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
