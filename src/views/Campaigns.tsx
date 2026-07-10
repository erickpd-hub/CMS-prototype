import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Facebook, Search, StopCircle, PlayCircle, Sparkles, Target } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';

import { ToastType } from '../components/Toast';

const initialMockCampaigns = [
  { name: 'Summer Sale Retargeting', platform: 'Meta', status: 'active', budget: '$50/day', cpa: '$12.50', roas: '2.4x', color: '#1877F2', aiInsight: 'Increase budget by 15% to capture peak evening traffic.' },
  { name: 'Search: Brand Terms', platform: 'Google', status: 'active', budget: '$100/day', cpa: '$8.20', roas: '4.1x', color: '#EA4335', aiInsight: 'Optimal performance. AI bidding is maintaining target CPA.' },
  { name: 'GenZ Influencer Push', platform: 'TikTok', status: 'paused', budget: '$200/day', cpa: '$45.00', roas: '0.8x', color: '#000000', aiInsight: 'Paused by AI. Creative fatigue detected after 4 days. Regenerate creatives.' },
];

export default function Campaigns({ addToast }: { addToast?: (msg: string, type: ToastType) => void }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [campaignsList, setCampaignsList] = useState<any[]>([]);

  // Map platform strings to icons
  const platformIcons: Record<string, any> = {
    'Meta': Facebook,
    'Google': Search,
    'TikTok': Target,
  };

  // Sync campaigns list from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'campaigns'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          ...data
        });
      });

      if (list.length === 0) {
        // Seed initial campaigns into Firestore
        initialMockCampaigns.forEach(async (camp) => {
          await addDoc(collection(db, 'campaigns'), {
            userId: user.id,
            ...camp
          });
        });
      } else {
        setCampaignsList(list);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const toggleCampaignStatus = async (campId: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const docRef = doc(db, 'campaigns', campId);
      await updateDoc(docRef, { status: nextStatus });
      
      if (nextStatus === 'paused') {
        await addNotification(`Paused campaign: ${name}`, 'warning');
      } else {
        await addNotification(`Resumed campaign: ${name}`, 'success');
      }
    } catch (err) {
      console.error("Error updating campaign status in Firestore:", err);
      addToast?.(t('Failed to update campaign status'), 'error');
    }
  };

  const applyAIRecommendations = async () => {
    const target = campaignsList.find(c => c.name === 'Summer Sale Retargeting');
    if (target) {
      try {
        const docRef = doc(db, 'campaigns', target.id);
        await updateDoc(docRef, { 
          budget: '$58/day', 
          aiInsight: 'AI recommendations applied. Budget optimized successfully to maximize conversion velocity.' 
        });
        await addNotification('Applied AI recommendations to Meta Retargeting.', 'success');
      } catch (err) {
        console.error("Error applying recommendations to Firestore:", err);
        addToast?.(t('Failed to apply AI recommendations'), 'error');
      }
    } else {
      await addNotification('Applied AI recommendations to Meta Retargeting.', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* AI Campaign Admin Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Sparkles className="w-5 h-5 text-[var(--color-m3-primary)]" />
               <h2 className="text-xl font-medium tracking-tight">{t('AI Campaign Manager')}</h2>
            </div>
            <p className="text-sm opacity-90 max-w-xl">
              {t('AI has auto-paused 1 underperforming campaign and suggests budget re-allocation for Meta ads to maximize ROAS based on current ecommerce trends.')}
            </p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={applyAIRecommendations}
               className="bg-[var(--color-m3-on-primary-container)] text-[var(--color-m3-primary-container)] px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
             >
               {t('Apply AI Recommendations')}
             </button>
             <button className="bg-transparent border border-[var(--color-m3-on-primary-container)]/30 text-[var(--color-m3-on-primary-container)] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--color-m3-on-primary-container)]/10 transition-colors">
               {t('Review Rules')}
             </button>
          </div>
        </div>
      </motion.div>

      {/* Campaigns list */}
      <div className="grid gap-4">
        {campaignsList.map((camp, idx) => {
          const IconComponent = platformIcons[camp.platform] || Target;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              key={camp.id} 
              className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] border border-[var(--color-m3-outline-variant)]"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-[var(--color-m3-outline-variant)] flex items-center justify-center bg-[var(--color-m3-surface)] shadow-sm">
                     <IconComponent className="w-6 h-6" style={{ color: camp.platform === 'TikTok' ? 'var(--color-m3-on-surface)' : camp.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-[var(--color-m3-on-surface)]">{camp.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${camp.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {camp.status === 'active' ? t('Active') : t('Paused')}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-m3-on-surface-variant)]">{camp.platform} Ads • {camp.budget}</p>
                  </div>
                </div>

                <div className="flex gap-8">
                   <div>
                      <p className="text-xs text-[var(--color-m3-on-surface-variant)] mb-1">CPA</p>
                      <p className="text-lg font-medium text-[var(--color-m3-on-surface)]">{camp.cpa}</p>
                   </div>
                   <div>
                      <p className="text-xs text-[var(--color-m3-on-surface-variant)] mb-1">{t('ROAS')}</p>
                      <p className="text-lg font-medium text-[var(--color-m3-on-surface)]">{camp.roas}</p>
                   </div>
                </div>

                <div className="w-full md:w-auto flex flex-col md:items-end gap-3">
                   <div className="text-sm text-[var(--color-m3-on-surface-variant)] flex items-start gap-2 max-w-sm bg-[var(--color-m3-surface-variant)] p-3 rounded-xl">
                     <Sparkles className="w-4 h-4 text-[var(--color-m3-primary)] shrink-0 mt-0.5" />
                     <p className="text-xs leading-relaxed">{t(camp.aiInsight)}</p>
                   </div>
                   {camp.status === 'active' ? (
                     <button 
                       onClick={() => toggleCampaignStatus(camp.id, camp.name, camp.status)}
                       className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
                     >
                       <StopCircle className="w-4 h-4" /> {t('Pause')}
                     </button>
                   ) : (
                     <button 
                       onClick={() => toggleCampaignStatus(camp.id, camp.name, camp.status)}
                       className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
                     >
                       <PlayCircle className="w-4 h-4" /> {t('Resume')}
                     </button>
                   )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
