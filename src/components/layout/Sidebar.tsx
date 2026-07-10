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
    <div className="flex flex-col h-full bg-[var(--color-m3-surface)] w-72 lg:w-80 shadow-[var(--shadow-m3-2)] lg:shadow-none z-50 transition-colors">
      <div className="flex items-center justify-between h-16 px-6 pt-4">
        <span className="text-xl font-medium text-[var(--color-m3-on-surface)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] flex items-center justify-center font-bold">
            C
          </div>
          CMS Prototype
        </span>
        <button className="lg:hidden p-2 text-[var(--color-m3-on-surface-variant)] rounded-full hover:bg-[var(--color-m3-surface-variant)]" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center px-4 py-3.5 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-secondary-container)] font-medium'
                  : 'text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-variant)]'
              }`}
            >
              <Icon className={`w-6 h-6 mr-3 ${isActive ? 'text-[var(--color-m3-on-secondary-container)]' : 'text-[var(--color-m3-on-surface-variant)]'}`} />
              <span className="text-sm tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 mb-2">
        <button onClick={() => handleNavigate('profile')} className="w-full flex items-center text-left gap-4 px-4 py-3 rounded-2xl hover:bg-[var(--color-m3-surface-variant)] transition-colors cursor-pointer text-[var(--color-m3-on-surface)]">
          <div className="w-10 h-10 rounded-full bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] flex items-center justify-center font-medium shrink-0 uppercase">
            {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U'}
          </div>
          <div className="truncate">
            <p className="text-sm font-medium truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </p>
            <p className="text-xs text-[var(--color-m3-on-surface-variant)] truncate capitalize">
              {user ? t(user.role) : ''}
            </p>
          </div>
        </button>
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
            className="fixed inset-y-0 left-0 z-50 lg:hidden flex"
          >
            {SidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:block lg:flex-shrink-0 z-10 w-80">
        {SidebarContent}
      </div>
    </>
  );
}
