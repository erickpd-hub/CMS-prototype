import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ViewId } from '../../types';
import { AnimatePresence, motion } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Layout({ children, currentView, onNavigate, isDarkMode, toggleDarkMode }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-900 text-[var(--color-m3-on-surface)] selection:bg-[var(--color-m3-primary-container)] selection:text-[var(--color-m3-on-primary-container)] font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={onNavigate} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex flex-col flex-1 w-full overflow-hidden bg-gray-400 dark:bg-zinc-800 rounded-tl-3xl my-0 ml-0 lg:my-2 lg:ml-2">
        <Header 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
          onMenuClick={() => setIsSidebarOpen(true)}
          currentView={currentView}
          onNavigate={onNavigate}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-7xl mx-auto h-full bg-[var(--color-m3-surface)] rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-800"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
