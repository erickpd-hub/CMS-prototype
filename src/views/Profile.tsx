import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Bell, Shield, Key, MapPin, Globe, CreditCard, Clock, Save, Camera, LogOut } from 'lucide-react';
import { ToastType } from '../components/Toast';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Profile({ addToast }: { addToast?: (msg: string, type: ToastType) => void }) {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useLanguage();
  const { user, logout, updateUser } = useAuth();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        updateUser(user.id, { firstName, lastName, email });
      }
      setIsSaving(false);
      addToast?.(t('Save Changes') + '...', 'success');
    }, 800);
  };

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-m3-surface)] shadow-[var(--shadow-m3-1)] rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[var(--color-m3-primary)]/20 to-[var(--color-m3-tertiary)]/20" />
        
        <div className="relative z-10 group">
          <div className="w-32 h-32 rounded-full bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] flex items-center justify-center text-4xl font-semibold shadow-[var(--shadow-m3-2)] border-4 border-[var(--color-m3-surface)] uppercase">
            {firstName?.[0]}{lastName?.[0]}
          </div>
          <button className="absolute bottom-0 right-0 p-2.5 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <h2 className="text-3xl font-normal tracking-tight text-[var(--color-m3-on-surface)] mb-2">{firstName} {lastName}</h2>
          <p className="text-[var(--color-m3-on-surface-variant)] text-lg mb-4">{user?.role === 'admin' ? 'Admin' : 'User'}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] text-sm rounded-full">
              <MapPin className="w-4 h-4" /> San Francisco, CA
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] text-sm rounded-full">
              <Globe className="w-4 h-4" /> PST (UTC-8)
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Navigation / Tabs (Static visual representation for now) */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <div className="bg-[var(--color-m3-surface)] rounded-3xl p-3 shadow-[var(--shadow-m3-1)]">
            {[
              { id: 'general', label: 'General Info', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'billing', label: 'Billing', icon: CreditCard },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === tab.id ? 'bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-secondary-container)] font-medium' : 'text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-variant)]'}`}
              >
                <tab.icon className="w-5 h-5" />
                {t(tab.label)}
              </button>
            ))}
            <div className="my-2 border-t border-[var(--color-m3-outline-variant)]"></div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
            >
              <LogOut className="w-5 h-5" />
              {t('Logout')}
            </button>
          </div>
        </motion.div>

        {/* Right Column: Content */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 space-y-6"
        >
          {/* General Information Form */}
          {activeTab === 'general' && (
            <>
              <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-m3-1)]">
                <h3 className="text-xl font-normal text-[var(--color-m3-on-surface)] mb-6">{t('Personal Details')}</h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-2 border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] px-4 py-2 transition-colors">
                  <label className="text-xs text-[var(--color-m3-on-surface-variant)] font-medium">{t('First Name')}</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-transparent border-none outline-none text-[var(--color-m3-on-surface)] pt-1" />
                </div>
                <div className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-2 border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] px-4 py-2 transition-colors">
                  <label className="text-xs text-[var(--color-m3-on-surface-variant)] font-medium">{t('Last Name')}</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-transparent border-none outline-none text-[var(--color-m3-on-surface)] pt-1" />
                </div>
              </div>

              <div className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-2 border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] px-4 py-2 transition-colors">
                <label className="text-xs text-[var(--color-m3-on-surface-variant)] font-medium flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {t('Email Address')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border-none outline-none text-[var(--color-m3-on-surface)] pt-1" />
              </div>

              <div className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-2 border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] px-4 py-2 transition-colors">
                <label className="text-xs text-[var(--color-m3-on-surface-variant)] font-medium">{t('Role')}</label>
                <select className="w-full bg-transparent border-none outline-none text-[var(--color-m3-on-surface)] pt-1 cursor-pointer" disabled>
                  <option>{user?.role === 'admin' ? t('Admin') : t('User')}</option>
                </select>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-m3-outline-variant)] flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all hover:shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isSaving ? '...' : t('Save Changes')}
              </button>
            </div>
          </div>

              {/* Preferences snippet */}
              <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-m3-1)]">
                 <h3 className="text-xl font-normal text-[var(--color-m3-on-surface)] mb-4">{t('Quick Preferences')}</h3>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between py-2 border-b border-[var(--color-m3-outline-variant)]">
                      <div>
                        <p className="font-medium text-[var(--color-m3-on-surface)]">{t('AI Campaign Alerts')}</p>
                        <p className="text-sm text-[var(--color-m3-on-surface-variant)]">{t('Receive toast notifications for AI changes.')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[var(--color-m3-surface-variant)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-m3-on-surface-variant)] peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-m3-primary)]"></div>
                      </label>
                   </div>
                   <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-[var(--color-m3-on-surface)]">{t('Weekly Report Digest')}</p>
                        <p className="text-sm text-[var(--color-m3-on-surface-variant)]">{t('Email summary of ecommerce analytics.')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-[var(--color-m3-surface-variant)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-m3-on-surface-variant)] peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-m3-primary)]"></div>
                      </label>
                   </div>
                 </div>
              </div>
            </>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-m3-1)]">
             <h3 className="text-xl font-normal text-[var(--color-m3-on-surface)] mb-4">{t('Notifications')}</h3>
             <div className="space-y-4">
               <div className="flex items-center justify-between py-2 border-b border-[var(--color-m3-outline-variant)]">
                  <div>
                    <p className="font-medium text-[var(--color-m3-on-surface)]">{t('Email Notifications')}</p>
                    <p className="text-sm text-[var(--color-m3-on-surface-variant)]">{t('Receive daily summaries via email.')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-[var(--color-m3-surface-variant)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-m3-on-surface-variant)] peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-m3-primary)]"></div>
                  </label>
               </div>
               <div className="flex items-center justify-between py-2 border-b border-[var(--color-m3-outline-variant)]">
                  <div>
                    <p className="font-medium text-[var(--color-m3-on-surface)]">{t('Push Notifications')}</p>
                    <p className="text-sm text-[var(--color-m3-on-surface-variant)]">{t('Instant alerts on your device.')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" />
                    <div className="w-11 h-6 bg-[var(--color-m3-surface-variant)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-m3-on-surface-variant)] peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-m3-primary)]"></div>
                  </label>
               </div>
               <div className="flex items-center justify-between py-2 border-b border-[var(--color-m3-outline-variant)]">
                  <div>
                    <p className="font-medium text-[var(--color-m3-on-surface)]">{t('AI Campaign Alerts')}</p>
                    <p className="text-sm text-[var(--color-m3-on-surface-variant)]">{t('Receive toast notifications for AI changes.')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-[var(--color-m3-surface-variant)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-m3-on-surface-variant)] peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-m3-primary)]"></div>
                  </label>
               </div>
             </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-m3-1)]">
              <h3 className="text-xl font-normal text-[var(--color-m3-on-surface)] mb-6">{t('Security Settings')}</h3>
              
              <div className="space-y-5 mb-8">
                <div className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-2 border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] px-4 py-2 transition-colors">
                  <label className="text-xs text-[var(--color-m3-on-surface-variant)] font-medium">{t('Current Password')}</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-transparent border-none outline-none text-[var(--color-m3-on-surface)] pt-1" />
                </div>
                <div className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-2 border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] px-4 py-2 transition-colors">
                  <label className="text-xs text-[var(--color-m3-on-surface-variant)] font-medium">{t('New Password')}</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-transparent border-none outline-none text-[var(--color-m3-on-surface)] pt-1" />
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-[var(--color-m3-outline-variant)]">
                  <div>
                    <p className="font-medium text-[var(--color-m3-on-surface)]">{t('Two-Factor Authentication')}</p>
                    <p className="text-sm text-[var(--color-m3-on-surface-variant)]">{t('Add an extra layer of security.')}</p>
                  </div>
                  <button className="px-4 py-2 rounded-full border border-[var(--color-m3-outline)] text-[var(--color-m3-on-surface)] text-sm font-medium hover:bg-[var(--color-m3-surface-variant)] transition-colors">
                    {t('Enable')}
                  </button>
               </div>

              <div className="mt-6 flex justify-end">
                <button className="bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all hover:shadow-md active:scale-95">
                  {t('Update Password')}
                </button>
              </div>
            </div>
          )}

          {/* Billing */}
          {activeTab === 'billing' && (
            <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-m3-1)]">
              <h3 className="text-xl font-normal text-[var(--color-m3-on-surface)] mb-6">{t('Billing & Plans')}</h3>
              
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--color-m3-primary-container)] to-transparent border border-[var(--color-m3-primary)]/20 mb-8">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-m3-primary)] mb-1 block">{t('Current Plan')}</span>
                    <h4 className="text-2xl font-bold text-[var(--color-m3-on-surface)]">Pro Enterprise</h4>
                  </div>
                  <span className="text-xl font-medium text-[var(--color-m3-on-surface)]">$49<span className="text-sm text-[var(--color-m3-on-surface-variant)]">/mo</span></span>
                </div>
                <p className="text-sm text-[var(--color-m3-on-surface-variant)] mb-4">{t('Next billing date')}: Oct 1, 2026</p>
                <button className="px-4 py-2 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full text-sm font-medium hover:shadow-md transition-shadow">
                  {t('Upgrade Plan')}
                </button>
              </div>

              <h4 className="font-medium text-[var(--color-m3-on-surface)] mb-4">{t('Payment Method')}</h4>
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-m3-outline-variant)] mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center font-bold text-xs text-slate-600 italic">VISA</div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-m3-on-surface)]">Visa ending in 4242</p>
                    <p className="text-xs text-[var(--color-m3-on-surface-variant)]">Expires 12/28</p>
                  </div>
                </div>
                <button className="text-sm text-[var(--color-m3-primary)] font-medium hover:underline">{t('Edit')}</button>
              </div>

              <h4 className="font-medium text-[var(--color-m3-on-surface)] mb-4">{t('Billing History')}</h4>
              <div className="space-y-3">
                {[
                  { date: 'Sep 1, 2026', amount: '$49.00', status: 'Paid' },
                  { date: 'Aug 1, 2026', amount: '$49.00', status: 'Paid' },
                  { date: 'Jul 1, 2026', amount: '$49.00', status: 'Paid' },
                ].map((invoice, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-m3-outline-variant)] last:border-0">
                    <span className="text-sm text-[var(--color-m3-on-surface-variant)]">{invoice.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-[var(--color-m3-on-surface)]">{invoice.amount}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{invoice.status}</span>
                      <button className="text-[var(--color-m3-primary)] hover:bg-[var(--color-m3-primary-container)] p-1.5 rounded-full transition-colors"><Save className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
