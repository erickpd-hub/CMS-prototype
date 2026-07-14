import React from 'react';
import { ViewId } from '../../types';
import { LayoutDashboard, CalendarDays, BarChart3, Plug, X, Megaphone, Users as UsersIcon, Sparkles, Box, User as UserAvatar } from 'lucide-react';
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
        className="flex items-center justify-center text-black dark:text-white cursor-pointer hover:opacity-70 transition-opacity"
        title="Dashboard"
      >
        <Box className="w-8 h-8" />
      </div>

      {/* Middle: Pill Nav */}
      <nav className="flex flex-col items-center py-4 px-2 space-y-3 bg-[#E0E0E0] dark:bg-zinc-800 rounded-full shadow-inner my-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              title={item.label}
              className={`relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full transition-colors duration-200 group ${
                isActive
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-black dark:bg-zinc-900 rounded-full shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {/* Dark background on hover to make white icon visible */}
              {!isActive && (
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              )}
              <div className="relative flex flex-col items-center justify-center z-10 w-full h-full">
                <Icon className={isActive ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 sm:w-5 sm:h-5 transition-colors group-hover:text-white"} />
                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-black text-white text-[11px] font-medium tracking-wide rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[60] transition-all duration-200 shadow-lg translate-x-1 group-hover:translate-x-0 hidden sm:block">
                  {item.label}
                  {/* Tooltip Arrow */}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-black"></div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
      
      {/* Bottom: PIC */}
      <div 
        onClick={() => handleNavigate('profile')} 
        className="flex items-center justify-center text-black dark:text-white cursor-pointer hover:opacity-70 transition-opacity"
        title="Profile"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <UserAvatar className="w-8 h-8" />
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
