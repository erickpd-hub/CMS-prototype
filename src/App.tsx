/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { ViewId } from './types';
import Layout from './components/layout/Layout';
import Dashboard from './views/Dashboard';
import Campaigns from './views/Campaigns';
import Scheduler from './views/Scheduler';
import Analytics from './views/Analytics';
import Integrations from './views/Integrations';
import Profile from './views/Profile';
import Users from './views/Users';
import Login from './views/Login';
import AEO from './views/AEO';
import { ViewSkeleton } from './components/Skeleton';
import ToastContainer, { ToastMessage, ToastType } from './components/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationsProvider, useNotifications } from './context/NotificationsContext';

function AppContent() {
  const { user, loading } = useAuth();
  const { notifications, addNotification } = useNotifications();
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const [isViewLoading, setIsViewLoading] = useState(false);

  const handleNavigate = (view: ViewId) => {
    setIsViewLoading(true);
    setCurrentView(view);
    setTimeout(() => {
      setIsViewLoading(false);
    }, 450);
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const nextIsDark = !isDarkMode;

    if (!document.startViewTransition) {
      setIsDarkMode(nextIsDark);
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(nextIsDark);
      });
    });

    transition.ready.then(() => {
      const x = window.innerWidth / 2;
      const y = window.innerHeight; // Bottom center

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [mountedTime] = useState(() => Date.now());
  const [processedIds] = useState(() => new Set<string>());

  useEffect(() => {
    if (notifications.length === 0) return;
    
    notifications.forEach((notif) => {
      // If notification is unread, was created after mount, and not yet processed as toast
      if (!notif.read && notif.timestamp.getTime() > mountedTime && !processedIds.has(notif.id)) {
        processedIds.add(notif.id);
        addToast(notif.message, notif.type);
      }
    });
  }, [notifications, mountedTime, processedIds]);

  useEffect(() => {
    if (!user) return; // Wait until logged in
    // Automated notifications simulation
    const messages = [
      { msg: 'AI Alert: "GenZ Push" campaign CTR dropped below threshold. Action recommended.', type: 'warning' as ToastType },
      { msg: 'New conversion spike detected in Meta Ads! View Analytics.', type: 'success' as ToastType },
      { msg: 'Scheduled post was successfully published to Facebook and Twitter.', type: 'info' as ToastType },
      { msg: 'Sync Alert: LinkedIn Marketing API delayed response.', type: 'error' as ToastType },
    ];
    let count = 0;
    const interval = setInterval(() => {
      const alert = messages[count % messages.length];
      addNotification(alert.msg, alert.type);
      count++;
    }, 20000);

    setTimeout(() => {
       addNotification('System online. AI Campaign Manager is actively optimizing.', 'info');
    }, 2000);

    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#15131D] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderView = () => {
    if (isViewLoading) {
      return <ViewSkeleton view={currentView} />;
    }
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
      case 'campaigns': return <Campaigns addToast={addToast} />;
      case 'scheduler': return <Scheduler addToast={addToast} />;
      case 'aeo': return <AEO onNavigate={handleNavigate} addToast={addToast} />;
      case 'analytics': return <Analytics />;
      case 'integrations': return <Integrations addToast={addToast} />;
      case 'profile': return <Profile addToast={addToast} />;
      case 'users': return <Users addToast={addToast} />;
      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full w-full">
            <Login />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full w-full">
            <Layout 
              currentView={currentView} 
              onNavigate={handleNavigate}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            >
              {renderView()}
            </Layout>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationsProvider>
          <AppContent />
        </NotificationsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
