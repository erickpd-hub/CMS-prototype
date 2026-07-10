import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const typeConfig = {
  success: { icon: CheckCircle2, bg: 'bg-emerald-500 border-emerald-500', text: 'text-white', iconColor: 'text-white' },
  error: { icon: AlertCircle, bg: 'bg-red-500 border-red-500', text: 'text-white', iconColor: 'text-white' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500 border-amber-500', text: 'text-amber-950', iconColor: 'text-amber-950' },
  info: { icon: Info, bg: 'bg-blue-500 border-blue-500', text: 'text-white', iconColor: 'text-white' },
};

export default function ToastContainer({ toasts, removeToast }: ToastProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-md px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = typeConfig[toast.type];
          return (
            <motion.div
              layout
              key={toast.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-[var(--shadow-m3-3)] border ${config.bg} ${config.text}`}
            >
              <div className="flex items-start gap-3">
                <config.icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
                <span className="text-sm font-medium leading-relaxed">{t(toast.message)}</span>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className={`ml-4 p-1.5 shrink-0 rounded-full hover:bg-black/10 transition-colors ${config.text}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
