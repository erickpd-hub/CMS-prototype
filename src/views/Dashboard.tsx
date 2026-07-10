import React, { useState, useEffect } from 'react';
import { ViewId } from '../types';
import { Users, TrendingUp, Presentation, MousePointerClick, ArrowUpRight, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const mockChartData = [
  { name: 'Mon', reach: 4000, engagement: 2400 },
  { name: 'Tue', reach: 3000, engagement: 1398 },
  { name: 'Wed', reach: 2000, engagement: 9800 },
  { name: 'Thu', reach: 2780, engagement: 3908 },
  { name: 'Fri', reach: 1890, engagement: 4800 },
  { name: 'Sat', reach: 2390, engagement: 3800 },
  { name: 'Sun', reach: 3490, engagement: 4300 },
];

export default function Dashboard({ onNavigate }: { onNavigate: (v: ViewId) => void }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [activeCampaignsCount, setActiveCampaignsCount] = useState<number>(2);
  const [upcomingPosts, setUpcomingPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Listen to campaigns to count actives
    const campaignsQ = query(collection(db, 'campaigns'), where('userId', '==', user.id));
    const unsubscribeCampaigns = onSnapshot(campaignsQ, (snapshot) => {
      let activeCount = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'active') {
          activeCount++;
        }
      });
      setActiveCampaignsCount(snapshot.size === 0 ? 2 : activeCount);
    });

    // Listen to posts for current user
    const postsQ = query(collection(db, 'posts'), where('userId', '==', user.id));
    const unsubscribePosts = onSnapshot(postsQ, (snapshot) => {
      const postsList: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const dateVal = data.scheduledDate;
        let scheduledDate = new Date();
        if (dateVal) {
          if (typeof dateVal.toDate === 'function') {
            scheduledDate = dateVal.toDate();
          } else {
            scheduledDate = new Date(dateVal);
          }
        }
        postsList.push({
          id: doc.id,
          content: data.content || '',
          platforms: data.platforms || [],
          scheduledDate: scheduledDate,
        });
      });
      
      // Sort ascending or descending by date
      postsList.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
      setUpcomingPosts(postsList.slice(0, 3));
    });

    return () => {
      unsubscribeCampaigns();
      unsubscribePosts();
    };
  }, [user]);

  const stats = [
    { label: t('Total Reach'), value: '2.4M', icon: Users, increment: '+12.5%' },
    { label: t('Engagement Rate'), value: '4.2%', icon: TrendingUp, increment: '+1.2%' },
    { label: t('Active Campaigns'), value: activeCampaignsCount.toString(), icon: Presentation, increment: '0%' },
    { label: t('Total Conversions'), value: '840', icon: MousePointerClick, increment: '+8.4%' },
  ];

  return (
    <div className="space-y-6 relative pb-20">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[var(--color-m3-surface)] shadow-[var(--shadow-m3-1)] transition-shadow hover:shadow-[var(--shadow-m3-2)] rounded-3xl p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-medium tracking-wide text-[var(--color-m3-on-surface-variant)]">{stat.label}</h4>
                <p className="text-3xl font-normal text-[var(--color-m3-on-surface)] mt-2">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--color-m3-primary-container)] flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-[var(--color-m3-on-primary-container)]" />
              </div>
            </div>
            <div className="mt-6 flex items-center text-sm">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {stat.increment}
              </span>
              <span className="text-[var(--color-m3-on-surface-variant)] ml-2">{t('from last week')}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[var(--color-m3-surface)] shadow-[var(--shadow-m3-1)] rounded-3xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-[var(--color-m3-on-surface)]">{t('Reach vs Engagement')}</h3>
            <div className="relative">
              <select className="appearance-none bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] text-sm rounded-lg px-4 py-2 pr-8 outline-none border-b-2 border-transparent focus:border-[var(--color-m3-primary)] transition-colors">
                <option>{t('Last 7 days')}</option>
                <option>{t('Last 30 days')}</option>
                <option>{t('This Year')}</option>
              </select>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-m3-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-m3-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-m3-secondary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-m3-secondary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-m3-outline)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-m3-on-surface-variant)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-m3-on-surface-variant)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-m3-surface-variant)', borderRadius: '12px', border: 'none', color: 'var(--color-m3-on-surface-variant)', padding: '12px' }}
                  itemStyle={{ color: 'var(--color-m3-on-surface)' }}
                />
                <Area type="monotone" dataKey="reach" stroke="var(--color-m3-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                <Area type="monotone" dataKey="engagement" stroke="var(--color-m3-secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Actions & Recent Activity (M3 Filled Card) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--color-m3-surface-variant)] rounded-3xl p-6 flex flex-col"
        >
          <h3 className="text-lg font-medium text-[var(--color-m3-on-surface)] mb-4">{t('Quick Actions')}</h3>
          <div className="space-y-3 mb-8">
            <button 
              onClick={() => onNavigate('scheduler')}
              className="w-full bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] font-medium py-3.5 px-6 rounded-full transition-all hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5"/>
              {t('New Post')}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onNavigate('campaigns')}
                className="w-full bg-transparent border border-[var(--color-m3-outline)] text-[var(--color-m3-primary)] font-medium py-2 px-3 text-sm rounded-full transition-all hover:bg-[var(--color-m3-primary)]/10 active:scale-[0.98] flex items-center justify-center"
              >
                {t('Campaigns')}
              </button>
              <button 
                onClick={() => onNavigate('analytics')}
                className="w-full bg-transparent border border-[var(--color-m3-outline)] text-[var(--color-m3-primary)] font-medium py-2 px-3 text-sm rounded-full transition-all hover:bg-[var(--color-m3-primary)]/10 active:scale-[0.98] flex items-center justify-center"
              >
                {t('Reports')}
              </button>
            </div>
          </div>

          <h3 className="text-lg font-medium text-[var(--color-m3-on-surface)] mb-4">{t('Upcoming Posts')}</h3>
          <div className="space-y-4 flex-1">
            {upcomingPosts.length === 0 ? (
              <p className="text-sm text-[var(--color-m3-on-surface-variant)] italic">
                {t('No upcoming posts scheduled.')}
              </p>
            ) : (
              upcomingPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-4">
                  <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-[var(--color-m3-primary)] flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-m3-on-surface)] line-clamp-1">
                      {post.content}
                    </p>
                    <p className="text-xs text-[var(--color-m3-on-surface-variant)] mt-1">
                      {post.scheduledDate.toLocaleDateString()} {post.scheduledDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {post.platforms.join(', ')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* M3 Floating Action Button (FAB) */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] rounded-[16px] shadow-[var(--shadow-m3-3)] hover:shadow-lg flex items-center justify-center z-40 transition-shadow"
        onClick={() => onNavigate('scheduler')}
        title="Schedule New Post"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
