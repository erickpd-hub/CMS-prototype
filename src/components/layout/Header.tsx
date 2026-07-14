import React, { useState, useEffect, useRef } from 'react';
import { Menu, Moon, Sun, Bell, Globe2, CheckCircle2, AlertTriangle, XCircle, Info, Trash2, Check } from 'lucide-react';
import { ViewId } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationsContext';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onMenuClick: () => void;
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
}

function getNotificationIcon(type: 'info' | 'success' | 'warning' | 'error') {
  switch (type) {
    case 'success': return CheckCircle2;
    case 'warning': return AlertTriangle;
    case 'error': return XCircle;
    default: return Info;
  }
}

function getNotificationIconColor(type: 'info' | 'success' | 'warning' | 'error') {
  switch (type) {
    case 'success': return 'text-emerald-500';
    case 'warning': return 'text-amber-500';
    case 'error': return 'text-red-500';
    default: return 'text-blue-500';
  }
}

function formatRelativeTime(date: Date, lang: string) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return lang === 'es' ? 'Hace un momento' : 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return lang === 'es' ? `Hace ${minutes} min` : `${minutes} mins ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return lang === 'es' ? `Hace ${hours} h` : `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return lang === 'es' ? `Hace ${days} d` : `${days}d ago`;
}

export default function Header({ isDarkMode, toggleDarkMode, onMenuClick, currentView, onNavigate }: HeaderProps) {
  const { lang, toggleLang, t } = useLanguage();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const titles: Record<ViewId, string> = {
    dashboard: t('Dashboard'),
    campaigns: t('Campaigns'),
    scheduler: t('Post Scheduler'),
    aeo: t('AEO Optimization'),
    analytics: t('Analytics'),
    integrations: t('Integrations'),
    profile: t('Profile'),
    users: t('Users'),
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-transparent text-[var(--color-m3-on-surface)] transition-colors sm:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="p-3 mr-2 text-[var(--color-m3-on-surface-variant)] rounded-full lg:hidden hover:bg-[var(--color-m3-surface-variant)] transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-[22px] font-normal tracking-tight">
          {titles[currentView]}
        </h1>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        <button 
          onClick={toggleLang}
          className="p-3 flex items-center gap-2 text-[var(--color-m3-on-surface-variant)] rounded-full hover:bg-[var(--color-m3-surface-variant)] transition-colors cursor-pointer uppercase text-sm font-bold"
          title="Toggle Language"
        >
          <Globe2 className="w-5 h-5" />
          <span className="hidden sm:inline">{lang}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-3 text-[var(--color-m3-on-surface-variant)] rounded-full hover:bg-[var(--color-m3-surface-variant)] transition-colors relative cursor-pointer"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-[var(--color-m3-surface)] rounded-full"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--color-m3-surface-container-high)] text-[var(--color-m3-on-surface)] rounded-2xl shadow-xl border border-[var(--color-m3-outline-variant)] overflow-hidden z-50 top-full"
              >
                {/* Dropdown Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface-container-highest)]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">{t('Notifications')}</h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs text-[var(--color-m3-primary)] hover:underline flex items-center gap-0.5 cursor-pointer"
                        title={t('Mark all as read')}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('Mark all as read')}</span>
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={() => clearAll()}
                        className="text-xs text-red-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                        title={t('Clear all')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('Clear all')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Dropdown Items List */}
                <div className="max-h-[350px] overflow-y-auto divide-y divide-[var(--color-m3-outline-variant)]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[var(--color-m3-on-surface-variant)] bg-[var(--color-m3-surface)]">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--color-m3-on-surface-variant)]" />
                      <p>{t('No notifications')}</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const IconComponent = getNotificationIcon(notif.type);
                      const iconColorClass = getNotificationIconColor(notif.type);
                      const relativeTime = formatRelativeTime(notif.timestamp, lang);

                      return (
                        <div
                          key={notif.id}
                          onClick={() => !notif.read && markAsRead(notif.id)}
                          className={`flex gap-3 p-4 hover:bg-[var(--color-m3-surface-variant)] transition-colors cursor-pointer group relative bg-[var(--color-m3-surface)] ${!notif.read ? 'bg-[var(--color-m3-primary-container)]/15 font-medium' : ''}`}
                        >
                          <div className={`mt-0.5 flex-shrink-0 ${iconColorClass}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <p className="text-sm text-[var(--color-m3-on-surface)] break-words">
                              {t(notif.message)}
                            </p>
                            <span className="text-[11px] text-[var(--color-m3-on-surface-variant)] block mt-1">
                              {relativeTime}
                            </span>
                          </div>
                          
                          {/* Action buttons on hover */}
                          <div className="absolute right-3 top-3 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notif.id);
                              }}
                              className="p-1 rounded-full text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-variant)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title={t('Delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {!notif.read && (
                            <span className="absolute right-4 bottom-4 w-2 h-2 bg-[var(--color-m3-primary)] rounded-full"></span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-3 text-[var(--color-m3-on-surface-variant)] rounded-full hover:bg-[var(--color-m3-surface-variant)] transition-colors cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
        <button 
          onClick={() => onNavigate('profile')}
          className="ml-2 w-10 h-10 rounded-full bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] flex items-center justify-center font-medium lg:hidden cursor-pointer hover:bg-[var(--color-m3-primary)] hover:text-[var(--color-m3-on-primary)] transition-colors uppercase text-sm"
        >
          {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U'}
        </button>
      </div>
    </header>
  );
}
