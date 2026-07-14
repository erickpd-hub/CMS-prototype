import React from 'react';
import { ViewId } from '../../types';
import { LayoutDashboard, CalendarDays, BarChart3, Plug, X, Megaphone, Users as UsersIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ currentView, onNavigate, isOpen, onClose }: SidebarProps) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const navItems: { id: ViewId; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard },
    { id: 'campaigns', label: t('Campaigns'), icon: Megaphone },
    { id: 'scheduler', label: t('Post Scheduler'), icon: CalendarDays },
    { id: 'aeo', label: t('AEO Optimization'), icon: Sparkles },
    { id: 'analytics', label: t('Analytics'), icon: BarChart3 },
    { id: 'integrations', label: t('Integrations'), icon: Plug },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'users', label: t('Users'), icon: UsersIcon });
  }

  const handleNavigate = (id: ViewId) => {
    onNavigate(id);
    onClose(); // close on mobile
  };

  const SidebarContent = (
    <div className="flex flex-col h-full items-center justify-between py-6 w-24 sm:w-32 bg-transparent z-50">
      {/* Top: LOGO */}
      <div 
        onClick={() => handleNavigate('dashboard')}
        className="w-16 h-16 rounded-2xl bg-[#454247] flex items-center justify-center text-white text-xs font-bold tracking-widest cursor-pointer shadow-lg hover:bg-[#555257] transition-colors"
      >
        LOGO
      </div>

      {/* Middle: Pill Nav */}
      <nav className="flex flex-col items-center py-4 px-2 space-y-4 bg-[#E0E0E0] dark:bg-zinc-800 rounded-full shadow-inner my-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              title={item.label}
              className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-300 dark:text-gray-400 dark:hover:bg-zinc-700'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                {isActive ? (
                  <span className="text-[10px] font-bold tracking-wider">BTN</span>
                ) : (
                  <>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                    <span className="text-[8px] uppercase tracking-wider hidden sm:block truncate w-14 text-center">{item.label}</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </nav>
      
      {/* Bottom: PIC */}
      <div 
        onClick={() => handleNavigate('profile')} 
        className="w-16 h-16 rounded-2xl bg-[#454247] flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow-lg hover:bg-[#555257] transition-colors relative"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
        ) : (
          user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'PIC'
        )}
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden flex bg-white dark:bg-zinc-900"
          >
            {SidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:flex lg:flex-shrink-0 z-10 w-32 items-center justify-center">
        {SidebarContent}
      </div>
    </>
  );
}
