import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  userId: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearNotification: async () => {},
  clearAll: async () => {},
});

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Notification[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let date = new Date();
        if (data.timestamp instanceof Timestamp) {
          date = data.timestamp.toDate();
        } else if (data.timestamp) {
          date = new Date(data.timestamp);
        }
        list.push({
          id: docSnap.id,
          message: data.message || '',
          type: data.type || 'info',
          timestamp: date,
          read: !!data.read,
          userId: data.userId || '',
        });
      });
      setNotifications(list);
    }, (error) => {
      console.error("Error listening to notifications:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const addNotification = async (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        message,
        type,
        timestamp: Timestamp.now(),
        read: false,
        userId: user.id,
      });
    } catch (err) {
      console.error("Failed to add notification to firestore:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, { read: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        if (!n.read) {
          const docRef = doc(db, 'notifications', n.id);
          batch.update(docRef, { read: true });
        }
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const clearNotification = async (id: string) => {
    try {
      const docRef = doc(db, 'notifications', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Failed to clear notification:", err);
    }
  };

  const clearAll = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        const docRef = doc(db, 'notifications', n.id);
        batch.delete(docRef);
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
