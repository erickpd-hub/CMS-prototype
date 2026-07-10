import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users as UsersIcon, Plus, Edit2, Trash2, Shield, User as UserIcon, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Role } from '../types';
import { ToastType } from '../components/Toast';

export default function Users({ addToast }: { addToast?: (msg: string, type: ToastType) => void }) {
  const { user: currentUser, users, addUser, updateUser, deleteUser } = useAuth();
  const { t } = useLanguage();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('user');

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[var(--color-m3-on-surface-variant)]">
        <Shield className="w-12 h-12 mb-4 opacity-50" />
        <p>{t('Access Denied: Admin only')}</p>
      </div>
    );
  }

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setRole(user.role);
    } else {
      setEditingUser(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('user');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      addToast?.(t('Please fill all fields'), 'error');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, { firstName, lastName, email, role });
      addToast?.(t('User updated successfully'), 'success');
    } else {
      addUser({ firstName, lastName, email, role });
      addToast?.(t('User created successfully'), 'success');
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      addToast?.(t('You cannot delete yourself'), 'error');
      return;
    }
    deleteUser(id);
    addToast?.(t('User deleted successfully'), 'info');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-normal text-[var(--color-m3-on-surface)] tracking-tight flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-[var(--color-m3-primary)]" />
            {t('User Management')}
          </h2>
          <p className="text-sm text-[var(--color-m3-on-surface-variant)] mt-1">
            {t('Add, edit, or remove users and manage their roles.')}
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] px-6 py-2.5 rounded-full text-sm font-medium hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('Add User')}
        </button>
      </div>

      <div className="bg-[var(--color-m3-surface)] rounded-3xl shadow-[var(--shadow-m3-1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-m3-outline-variant)] text-[var(--color-m3-on-surface-variant)]">
                <th className="py-4 px-6 font-medium text-sm">{t('Name')}</th>
                <th className="py-4 px-6 font-medium text-sm">{t('Email')}</th>
                <th className="py-4 px-6 font-medium text-sm">{t('Role')}</th>
                <th className="py-4 px-6 font-medium text-sm text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--color-m3-outline-variant)] last:border-0 hover:bg-[var(--color-m3-surface-variant)]/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] flex items-center justify-center font-medium">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-m3-on-surface)]">{u.firstName} {u.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-[var(--color-m3-on-surface-variant)]">
                    {u.email}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {u.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                      {t(u.role === 'admin' ? 'Admin' : 'User')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => openModal(u)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-variant)] hover:text-[var(--color-m3-primary)] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[var(--color-m3-on-surface-variant)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                      disabled={u.id === currentUser.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/40 z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--color-m3-surface)] rounded-3xl shadow-[var(--shadow-m3-3)] z-[101] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[var(--color-m3-outline-variant)] flex items-center justify-between">
                <h3 className="text-lg font-medium text-[var(--color-m3-on-surface)]">
                  {editingUser ? t('Edit User') : t('Add User')}
                </h3>
                <button onClick={closeModal} className="text-[var(--color-m3-on-surface-variant)] hover:text-[var(--color-m3-on-surface)] rounded-full p-2 hover:bg-[var(--color-m3-surface-variant)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-2 border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] px-4 py-2 transition-colors">
                    <label className="text-xs text-[var(--color-m3-on-surface-variant)] font-medium">{t('First Name')}</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-transparent border-none outline-none text-[var(--color-m3-on-surface)] pt-1" />
                  </div>
                  <div className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-2 border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] px-4 py-2 transition-colors">
                    <label className="text-xs text-[var(--color-m3-on-surface-variant)] font-medium">{t('Last Name')}</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-transparent border-none outline-none text-[var(--color-m3-on-surface)] pt-1" />
                  </div>
                </div>
                
                <div className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-2 border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] px-4 py-2 transition-colors">
                  <label className="text-xs text-[var(--color-m3-on-surface-variant)] font-medium">{t('Email Address')}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border-none outline-none text-[var(--color-m3-on-surface)] pt-1" />
                </div>

                <div className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-2 border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] px-4 py-2 transition-colors">
                  <label className="text-xs text-[var(--color-m3-on-surface-variant)] font-medium">{t('Role')}</label>
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value as Role)} 
                    className="w-full bg-transparent border-none outline-none text-[var(--color-m3-on-surface)] pt-1 cursor-pointer"
                    disabled={editingUser?.id === currentUser.id} // Prevents admin from demoting themselves
                  >
                    <option value="user">{t('User')}</option>
                    <option value="admin">{t('Admin')}</option>
                  </select>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-5 py-2 rounded-full font-medium text-[var(--color-m3-primary)] hover:bg-[var(--color-m3-primary)]/10 transition-colors">
                    {t('Cancel')}
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-full font-medium bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] hover:shadow-md transition-shadow">
                    {t('Save Changes')}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
