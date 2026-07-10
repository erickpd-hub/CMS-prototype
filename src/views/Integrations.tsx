import React, { useState, useEffect } from 'react';
import { AreaChart as GoogleAnalyticsIcon, Facebook, Linkedin, Instagram, Settings, CheckCircle2, AlertCircle, Target, Webhook, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import XIcon from '../components/XIcon';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';

import { ToastType } from '../components/Toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  connected: boolean;
  color: string;
  category: 'social' | 'analytics' | 'ads';
  status?: 'active' | 'error' | 'syncing';
  lastSync?: string;
  config?: Record<string, string>;
}

export default function Integrations({ addToast }: { addToast?: (msg: string, type: ToastType) => void }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'ga', name: 'Google Analytics 4', description: 'Track website traffic and user behavior', icon: GoogleAnalyticsIcon, connected: false, color: '#F59E0B', category: 'analytics' },
    { id: 'fb', name: 'Facebook Ads & Pages', description: 'Manage campaigns and track page feed updates', icon: Facebook, connected: false, color: '#1877F2', category: 'ads' },
    { id: 'li', name: 'LinkedIn Marketing', description: 'B2B lead generation and targeted professional posts', icon: Linkedin, connected: false, color: '#0A66C2', category: 'ads' },
    { id: 'webhook', name: 'Slack / Discord Webhook', description: 'Real-time notifications and cross-post updates to channels', icon: Webhook, connected: false, color: '#4A154B', category: 'social' },
    { id: 'tw', name: 'X', description: 'Schedule tweets and monitor trend topics', icon: XIcon, connected: false, color: '#000000', category: 'social' },
    { id: 'ig', name: 'Instagram Graph', description: 'Post scheduling and audience engagement metrics', icon: Instagram, connected: false, color: '#E4405F', category: 'social' },
  ]);

  // Subscribe to user integrations from Firestore
  useEffect(() => {
    if (!user) return;

    const colRef = collection(db, 'users', user.id, 'integrations');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const activeConfigs: Record<string, any> = {};
      snapshot.forEach((docSnap) => {
        activeConfigs[docSnap.id] = docSnap.data();
      });

      setIntegrations((prev) =>
        prev.map((integration) => {
          const config = activeConfigs[integration.id];
          if (config) {
            return {
              ...integration,
              connected: true,
              status: 'active',
              lastSync: config.updatedAt ? `Saved ${new Date(config.updatedAt).toLocaleDateString()}` : 'Connected',
              config: config
            };
          } else {
            return {
              ...integration,
              connected: false,
              status: undefined,
              lastSync: undefined,
              config: undefined
            };
          }
        })
      );
    });

    return () => unsubscribe();
  }, [user]);

  const openConfigModal = (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return;
    setModalConfig(integration.config || {});
    setActiveModalId(id);
  };

  const closeConfigModal = () => {
    setActiveModalId(null);
    setModalConfig({});
  };

  const handleTestConnection = async () => {
    if (!activeModalId) return;
    setIsTesting(true);
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: activeModalId,
          config: modalConfig
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        addToast?.(data.message || t('Connection test successful!'), 'success');
      } else {
        throw new Error(data.error || t('Connection test failed.'));
      }
    } catch (err: any) {
      console.error('Integration test error:', err);
      addToast?.(err.message || t('Connection test failed. please review your credentials.'), 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!user || !activeModalId) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', user.id, 'integrations', activeModalId);
      await setDoc(docRef, {
        ...modalConfig,
        updatedAt: new Date().toISOString()
      });
      addToast?.(t('Integration settings saved successfully!'), 'success');
      closeConfigModal();
    } catch (err: any) {
      console.error('Save integration error:', err);
      addToast?.(t('Failed to save integration settings.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user || !activeModalId) return;
    setIsDisconnecting(true);
    try {
      const docRef = doc(db, 'users', user.id, 'integrations', activeModalId);
      await deleteDoc(docRef);
      addToast?.(t('Integration disconnected.'), 'info');
      closeConfigModal();
    } catch (err: any) {
      console.error('Disconnect integration error:', err);
      addToast?.(t('Failed to disconnect integration.'), 'error');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const categories = [
    { title: t('Social Media Profiles'), filter: 'social' },
    { title: t('Analytics Data Sources'), filter: 'analytics' },
    { title: t('Ad Platforms'), filter: 'ads' },
  ];

  // Helper to render platform-specific form fields in the modal
  const renderConfigFields = (id: string) => {
    switch (id) {
      case 'webhook':
        return (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-m3-on-surface-variant)] leading-relaxed">
              {t('Integrate with a Discord, Slack, or any custom endpoint Webhook to push scheduled and published post updates instantly to a channel.')}
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-m3-on-surface)] uppercase tracking-wider">{t('Webhook URL')}</label>
              <input
                type="text"
                value={modalConfig.webhookUrl || ''}
                onChange={(e) => setModalConfig({ ...modalConfig, webhookUrl: e.target.value })}
                placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/services/..."
                className="w-full bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:outline-none outline-none text-[var(--color-m3-on-surface)]"
              />
            </div>
          </div>
        );
      case 'ga':
        return (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-m3-on-surface-variant)] leading-relaxed">
              {t('Connect your GA4 account using the Measurement Protocol to track custom publish events in your real-time analytics dashboard.')}
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-m3-on-surface)] uppercase tracking-wider">{t('Measurement ID')}</label>
                <input
                  type="text"
                  value={modalConfig.measurementId || ''}
                  onChange={(e) => setModalConfig({ ...modalConfig, measurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:outline-none outline-none text-[var(--color-m3-on-surface)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-m3-on-surface)] uppercase tracking-wider">{t('API Secret')}</label>
                <input
                  type="password"
                  value={modalConfig.apiSecret || ''}
                  onChange={(e) => setModalConfig({ ...modalConfig, apiSecret: e.target.value })}
                  placeholder="GA4 API Secret key"
                  className="w-full bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:outline-none outline-none text-[var(--color-m3-on-surface)]"
                />
              </div>
            </div>
          </div>
        );
      case 'tw':
        return (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-m3-on-surface-variant)] leading-relaxed">
              {t('Schedule or post directly to X (Twitter) using an official API Bearer Token. Generate these keys in the Twitter Developer Portal.')}
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-m3-on-surface)] uppercase tracking-wider">{t('Bearer Token')}</label>
              <input
                type="password"
                value={modalConfig.bearerToken || ''}
                onChange={(e) => setModalConfig({ ...modalConfig, bearerToken: e.target.value })}
                placeholder="X API Bearer Token"
                className="w-full bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:outline-none outline-none text-[var(--color-m3-on-surface)]"
              />
            </div>
          </div>
        );
      case 'li':
        return (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-m3-on-surface-variant)] leading-relaxed">
              {t('Publish updates directly to your professional profile feed or company organization page on LinkedIn.')}
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-m3-on-surface)] uppercase tracking-wider">{t('LinkedIn Access Token')}</label>
                <input
                  type="password"
                  value={modalConfig.accessToken || ''}
                  onChange={(e) => setModalConfig({ ...modalConfig, accessToken: e.target.value })}
                  placeholder="LinkedIn OAuth Access Token"
                  className="w-full bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:outline-none outline-none text-[var(--color-m3-on-surface)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-m3-on-surface)] uppercase tracking-wider">{t('Person URN or Org URN')}</label>
                <input
                  type="text"
                  value={modalConfig.personUrn || ''}
                  onChange={(e) => setModalConfig({ ...modalConfig, personUrn: e.target.value })}
                  placeholder="urn:li:person:abc12345 or urn:li:organization:xyz789"
                  className="w-full bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:outline-none outline-none text-[var(--color-m3-on-surface)]"
                />
              </div>
            </div>
          </div>
        );
      case 'fb':
      case 'ig':
        return (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-m3-on-surface-variant)] leading-relaxed">
              {t('Integrate Meta Pages and Instagram Graph to publish automated content and sync feed analytics.')}
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-m3-on-surface)] uppercase tracking-wider">{t('Graph Access Token')}</label>
                <input
                  type="password"
                  value={modalConfig.accessToken || ''}
                  onChange={(e) => setModalConfig({ ...modalConfig, accessToken: e.target.value })}
                  placeholder="Facebook/Instagram Graph Access Token"
                  className="w-full bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:outline-none outline-none text-[var(--color-m3-on-surface)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-m3-on-surface)] uppercase tracking-wider">{id === 'fb' ? t('Facebook Page ID') : t('Instagram Business Account ID')}</label>
                <input
                  type="text"
                  value={id === 'fb' ? modalConfig.pageId || '' : modalConfig.instagramBusinessId || ''}
                  onChange={(e) => setModalConfig({ 
                    ...modalConfig, 
                    [id === 'fb' ? 'pageId' : 'instagramBusinessId']: e.target.value 
                  })}
                  placeholder="e.g. 1029471923..."
                  className="w-full bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:outline-none outline-none text-[var(--color-m3-on-surface)]"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const selectedIntegration = integrations.find((i) => i.id === activeModalId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {categories.map((category, index) => {
        const categoryIntegrations = integrations.filter(i => i.category === category.filter);
        if (categoryIntegrations.length === 0) return null;

        return (
          <motion.div 
            key={category.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h2 className="text-sm font-medium tracking-wide text-[var(--color-m3-on-surface-variant)] mb-4 ml-2 uppercase">{category.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryIntegrations.map((int) => (
                <div key={int.id} className={`bg-[var(--color-m3-surface)] rounded-2xl p-6 transition-all ${int.connected ? 'border-2 border-[var(--color-m3-primary)] shadow-sm' : 'border border-[var(--color-m3-outline-variant)] hover:border-[var(--color-m3-outline)]'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-m3-surface-variant)]">
                        <int.icon className="w-6 h-6" style={{ color: !int.connected ? 'var(--color-m3-on-surface-variant)' : int.id === 'tk' || int.id === 'tw' || int.id === 'webhook' ? 'var(--color-m3-on-surface)' : int.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--color-m3-on-surface)] flex items-center gap-2">
                          {int.name}
                          {int.connected && int.status === 'active' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {int.connected && int.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </h3>
                        <p className="text-sm text-[var(--color-m3-on-surface-variant)] mt-1">{t(int.description)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-[var(--color-m3-outline-variant)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {int.connected ? (
                        <>
                          <div className={`w-2 h-2 rounded-full ${int.status === 'active' ? 'bg-emerald-500' : int.status === 'error' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`}></div>
                          <span className="text-xs font-medium text-[var(--color-m3-on-surface-variant)]">
                            {int.status === 'error' ? t('Connection Error') : `${t('Connected')} • ${t(int.lastSync || '')}`}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-[var(--color-m3-on-surface-variant)]">{t('Not connected')}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {int.connected && (
                        <button 
                          onClick={() => openConfigModal(int.id)}
                          className="p-2 text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-variant)] rounded-full transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => int.connected ? openConfigModal(int.id) : openConfigModal(int.id)}
                        className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                          int.connected 
                            ? 'border border-[var(--color-m3-outline)] text-[var(--color-m3-primary)] hover:bg-[var(--color-m3-primary)]/10'
                            : 'bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] hover:shadow-md'
                        }`}
                      >
                        {int.connected ? t('Settings') : t('Connect')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* M3 Modal Dialog */}
      <AnimatePresence>
        {activeModalId && selectedIntegration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeConfigModal}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-2xl border border-[var(--color-m3-outline-variant)] w-full max-w-lg z-10 flex flex-col gap-5 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-m3-outline-variant)] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-m3-surface-variant)]">
                    <selectedIntegration.icon className="w-5 h-5" style={{ color: selectedIntegration.id === 'tw' || selectedIntegration.id === 'webhook' ? 'var(--color-m3-on-surface)' : selectedIntegration.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[var(--color-m3-on-surface)]">{selectedIntegration.name}</h3>
                    <p className="text-xs text-[var(--color-m3-on-surface-variant)]">{t('Integration Settings')}</p>
                  </div>
                </div>
                <button onClick={closeConfigModal} className="p-1.5 rounded-full hover:bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 max-h-[60vh] overflow-y-auto pr-1">
                {renderConfigFields(activeModalId)}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-[var(--color-m3-outline-variant)] justify-between items-center">
                <div>
                  {selectedIntegration.connected && (
                    <button
                      disabled={isDisconnecting || isSaving}
                      onClick={handleDisconnect}
                      className="px-4 py-2 rounded-full text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-1"
                    >
                      {isDisconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {t('Disconnect')}
                    </button>
                  )}
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting || isSaving}
                    className="px-4 py-2 rounded-full text-sm font-semibold border border-[var(--color-m3-outline)] text-[var(--color-m3-primary)] hover:bg-[var(--color-m3-primary)]/10 transition-colors flex items-center gap-1.5"
                  >
                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {t('Test Connection')}
                  </button>
                  <button
                    onClick={handleSaveConnection}
                    disabled={isSaving || isTesting}
                    className="px-5 py-2 rounded-full text-sm font-semibold bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] hover:shadow-md transition-shadow flex items-center gap-1.5"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {t('Save')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
