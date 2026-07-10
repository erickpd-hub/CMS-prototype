import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { motion } from 'motion/react';
import { MousePointerClick, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const conversionData = [
  { name: 'Mon', organic: 400, paid: 240, social: 150 },
  { name: 'Tue', organic: 300, paid: 139, social: 100 },
  { name: 'Wed', organic: 500, paid: 400, social: 250 },
  { name: 'Thu', organic: 278, paid: 208, social: 190 },
  { name: 'Fri', organic: 189, paid: 180, social: 100 },
  { name: 'Sat', organic: 239, paid: 380, social: 300 },
  { name: 'Sun', organic: 349, paid: 430, social: 280 },
];

const platformData = [
  { name: 'Facebook', engagement: 65, conversions: 40 },
  { name: 'Instagram', engagement: 85, conversions: 30 },
  { name: 'LinkedIn', engagement: 45, conversions: 60 },
  { name: 'Twitter', engagement: 55, conversions: 20 },
  { name: 'TikTok', engagement: 95, conversions: 70 },
];

const leadsData = [
  { name: 'Mon', leads: 45, customers: 12 },
  { name: 'Tue', leads: 52, customers: 18 },
  { name: 'Wed', leads: 68, customers: 24 },
  { name: 'Thu', leads: 74, customers: 22 },
  { name: 'Fri', leads: 65, customers: 15 },
  { name: 'Sat', leads: 85, customers: 30 },
  { name: 'Sun', leads: 95, customers: 35 },
];

// Heatmap mock data (7 days x 12 hour blocks mapping to 24h just for visual density)
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = ['12a','2a','4a','6a','8a','10a','12p','2p','4p','6p','8p','10p'];

const heatmapData = days.map(day => ({
  day,
  data: hours.map(hour => Math.floor(Math.random() * 100))
}));

export default function Analytics() {
  const { t } = useLanguage();
  
  const [timeRange, setTimeRange] = useState('7d');

  const ecommerceMetrics = [
    { label: t('Total Leads (New)'), value: '1,452', increment: '+12%', icon: TrendingUp },
    { label: t('Add to Cart'), value: '840', increment: '+5%', icon: ShoppingCart },
    { label: t('Checkout Conversions'), value: '320', increment: '+18%', icon: MousePointerClick },
    { label: t('Total Revenue'), value: '$24K', increment: '+8%', icon: DollarSign },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Controls - M3 segmented buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex border border-[var(--color-m3-outline)] rounded-full overflow-hidden">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 text-sm font-medium transition-colors border-r border-[var(--color-m3-outline)] last:border-r-0 ${
                timeRange === range
                  ? 'bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-secondary-container)]'
                  : 'bg-transparent text-[var(--color-m3-on-surface)] hover:bg-[var(--color-m3-surface-variant)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <button className="text-[var(--color-m3-primary)] px-6 py-2 rounded-full hover:bg-[var(--color-m3-primary)]/10 text-sm font-medium transition-colors border border-[var(--color-m3-primary)]">
          {t('Export Report')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {ecommerceMetrics.map((metric, i) => (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.05 }}
             key={i} 
             className="bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] p-5 rounded-2xl shadow-[var(--shadow-m3-1)]"
           >
             <div className="flex justify-between items-start">
               <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1 opacity-80">{metric.label}</p>
                  <h4 className="text-2xl font-semibold">{metric.value}</h4>
               </div>
               <metric.icon className="w-5 h-5 opacity-80" />
             </div>
             <p className="text-xs font-medium mt-3 opacity-90">{metric.increment} vs last {timeRange}</p>
           </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversions Area Chart - M3 Elevated Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--color-m3-surface)] shadow-[var(--shadow-m3-1)] p-6 rounded-3xl"
        >
          <div className="mb-6">
            <h3 className="text-xl font-normal text-[var(--color-m3-on-surface)] tracking-tight">{t('Ecommerce Leads & Conversions')}</h3>
            <p className="text-sm text-[var(--color-m3-on-surface-variant)] mt-1">{t('Lead generation over time')}</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-m3-outline-variant)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-m3-on-surface-variant)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-m3-on-surface-variant)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-m3-surface-variant)', borderRadius: '12px', border: 'none', color: 'var(--color-m3-on-surface-variant)' }}
                  itemStyle={{ color: 'var(--color-m3-on-surface)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="leads" name={t('New Leads')} stroke="var(--color-m3-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="customers" name={t('Converted Customers')} stroke="var(--color-m3-secondary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Google Analytics Heatmap */}
         <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--color-m3-surface)] shadow-[var(--shadow-m3-1)] p-6 rounded-3xl flex flex-col"
        >
          <div className="mb-6">
            <div className="flex items-center gap-2">
               <h3 className="text-xl font-normal text-[var(--color-m3-on-surface)] tracking-tight">{t('Active Users Heatmap')}</h3>
               <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-sm dark:bg-emerald-900/30 dark:text-emerald-400">{t('LIVE GA4')}</span>
            </div>
            <p className="text-sm text-[var(--color-m3-on-surface-variant)] mt-1">{t('Visitor concentration by day & time')}</p>
          </div>
          
          <div className="flex-1 w-full overflow-x-auto">
             <div className="min-w-[400px] flex gap-1">
                <div className="flex flex-col gap-1 w-12 pt-6">
                   {days.map(d => (
                     <div key={d} className="h-6 flex items-center text-xs text-[var(--color-m3-on-surface-variant)]">{d}</div>
                   ))}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                   <div className="flex gap-1 h-6">
                      {hours.map(h => (
                        <div key={h} className="flex-1 text-[10px] text-center text-[var(--color-m3-on-surface-variant)]">{h}</div>
                      ))}
                   </div>
                   {heatmapData.map((dayRow, i) => (
                      <div key={i} className="flex gap-1 h-6">
                         {dayRow.data.map((val, idx) => (
                           <div 
                             key={idx} 
                             className="flex-1 rounded-[4px] min-w-[20px]"
                             style={{ 
                               backgroundColor: 'var(--color-m3-primary)', 
                               opacity: val > 80 ? 1 : val > 50 ? 0.7 : val > 20 ? 0.4 : 0.1
                             }}
                             title={`${dayRow.day} at ${hours[idx]}: ${val} users`}
                           ></div>
                         ))}
                      </div>
                   ))}
                </div>
             </div>
             <div className="mt-6 flex items-center justify-end gap-2 text-xs text-[var(--color-m3-on-surface-variant)]">
               <span>{t('Low')}</span>
               <div className="w-4 h-4 rounded-sm bg-[var(--color-m3-primary)] opacity-10"></div>
               <div className="w-4 h-4 rounded-sm bg-[var(--color-m3-primary)] opacity-40"></div>
               <div className="w-4 h-4 rounded-sm bg-[var(--color-m3-primary)] opacity-70"></div>
               <div className="w-4 h-4 rounded-sm bg-[var(--color-m3-primary)] opacity-100"></div>
               <span>{t('High Traffic')}</span>
             </div>
          </div>
        </motion.div>

        {/* Existing Charts */}
         <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--color-m3-surface)] shadow-[var(--shadow-m3-1)] p-6 rounded-3xl lg:col-span-2"
        >
          <div className="mb-6">
            <h3 className="text-xl font-normal text-[var(--color-m3-on-surface)] tracking-tight">{t('Platform Performance (Ads & Social)')}</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-m3-outline-variant)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-m3-on-surface-variant)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-m3-on-surface-variant)' }} />
                <Tooltip 
                  cursor={{ fill: 'var(--color-m3-surface-variant)' }}
                  contentStyle={{ backgroundColor: 'var(--color-m3-surface-variant)', borderRadius: '12px', border: 'none', color: 'var(--color-m3-on-surface-variant)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="engagement" name={t('Engagement Score')} fill="var(--color-m3-secondary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversions" name={t('Ad Conversions')} fill="var(--color-m3-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
