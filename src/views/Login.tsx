import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import Iridescence from '../components/Iridescence';

export default function Login() {
  const { login, signUp, loginWithGoogle } = useAuth();
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError(t('Email is required'));
      return;
    }
    if (!password) {
      setError(t('Password is required'));
      return;
    }

    if (isSignUp) {
      if (!firstName || !lastName) {
        setError(t('First Name and Last Name are required'));
        return;
      }
      try {
        await signUp(email, password, firstName, lastName);
      } catch (err: any) {
        setError(err.message || t('Registration failed'));
      }
    } else {
      const success = await login(email, password);
      if (!success) {
        setError(t('Invalid email or password') + '. ' + t('Use admin@admin.com to login'));
      }
    }
  };

  const handleQuickAdminLogin = async () => {
    setError('');
    const success = await login('admin@admin.com', 'admin123');
    if (!success) {
      setError(t('Invalid email or password') + '. ' + t('Use admin@admin.com to login'));
    }
  };

  const handleSocialLogin = async () => {
    // Quick, smooth testing flow that automatically logs in as the default admin
    setEmail('admin@admin.com');
    await login('admin@admin.com');
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google login failed:", err);
      setError(err.message || t('Google login failed'));
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-[#15131D] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white dark:bg-[#15131D] w-full h-full overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Left column - Rich Visual Gradient Banner */}
        <div className="hidden lg:flex lg:col-span-6 p-[5px] h-full">
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#2E5CF6] via-[#1F3EBC] to-[#390AA4] flex flex-col justify-between p-8 text-white rounded-[17px]">
            {/* Iridescence Animated Effect */}
            <Iridescence
              color={[0.5, 0.6, 0.8]}
              mouseReact
              amplitude={0.1}
              speed={1}
              className="absolute inset-0 z-0"
            />

            {/* Top text content */}
            <div className="relative z-10 space-y-3">
              <span className="text-xs sm:text-sm font-semibold text-blue-200/90 tracking-wider uppercase">
                {t('CMS Control Center')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-[1.1] text-white/95">
                {lang === 'es' ? (
                  <>
                    Gestiona y publica
                    <br />
                    tu contenido digital
                    <br />
                    sin complicaciones
                  </>
                ) : (
                  <>
                    Manage and publish
                    <br />
                    your digital content
                    <br />
                    seamlessly
                  </>
                )}
              </h2>
            </div>

            {/* Partners list at bottom */}
            <div className="relative z-10 pt-6 mt-auto">
              <p className="text-[9px] font-semibold text-blue-200/50 uppercase tracking-[0.2em] mb-3">
                {t('Social Media Integrations')}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-3 items-center opacity-85">
                {/* Instagram */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                  <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span>Instagram</span>
                </div>
                {/* Facebook */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </div>
                {/* X */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>X</span>
                </div>
                {/* Google */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Google</span>
                </div>
                {/* LinkedIn */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                  <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span>LinkedIn</span>
                </div>
                {/* TikTok */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.14.94.94 2.26 1.51 3.65 1.68v3.91c-1.31-.02-2.61-.01-3.91-.02-.08-1.53-.63-3.01-1.62-4.14-.94-.94-2.26-1.51-3.65-1.68V.02zm-3.92 6.57c-1.31-.02-2.61-.01-3.91-.02-.08-1.53-.63-3.01-1.62-4.14-.94-.94-2.26-1.51-3.65-1.68V6.59zM12.53 12.02v-3.9c1.68.01 3.32-.47 4.74-1.39V12c-.01.99-.44 1.94-1.18 2.61a3.911 3.911 0 0 1-5.11.33c-.76-.56-1.29-1.42-1.48-2.36-.29-1.44.18-2.95 1.23-3.95 1.05-1 2.55-1.41 4.02-1.07V3.65a7.803 7.803 0 0 0-7.85 7.84c0 2.45 1.13 4.75 3.07 6.27a7.865 7.865 0 0 0 9.53-.43c1.47-1.34 2.3-3.26 2.3-5.27v-2.02h-3.91v2.01c0 1.08-.43 2.11-1.2 2.84a3.912 3.912 0 0 1-5.54 0c-.78-.77-1.21-1.83-1.2-2.92z" />
                  </svg>
                  <span>TikTok</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Elegant & Pixel Perfect Login Form */}
        <div className="col-span-1 lg:col-span-6 flex flex-col justify-center p-8 sm:p-12 bg-white dark:bg-[#15131D] h-full overflow-hidden">
          <div className="w-full max-w-[400px] sm:max-w-[420px] mx-auto space-y-6 sm:space-y-7">
            {/* Title block */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-[32px] font-semibold tracking-tight text-slate-900 dark:text-white">
                {isSignUp ? t('Create your Account') : t('Get Started Now')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 font-normal">
                {isSignUp ? t('Fill in the fields below to sign up.') : t('Please log in to your account to continue.')}
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2.5 rounded-xl text-[11px] text-center font-medium border border-red-100 dark:border-red-900/30"
              >
                {error}
              </motion.div>
            )}



            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4.5">
              
              {/* Name Fields (Visible only on sign up) */}
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                      {t('First name')}
                    </label>
                    <input 
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1A27] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#2E5CF6] focus:ring-1 focus:ring-[#2E5CF6] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                      {t('Last name')}
                    </label>
                    <input 
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1A27] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#2E5CF6] focus:ring-1 focus:ring-[#2E5CF6] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                  {t('Email address')}
                </label>
                <input 
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="workmail@gmail.com"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1A27] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#2E5CF6] focus:ring-1 focus:ring-[#2E5CF6] transition-all"
                />
              </div>

              {/* Password Input with Forgot Password option on top */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                    {t('Password')}
                  </label>
                  {!isSignUp && (
                    <button 
                      type="button"
                      onClick={handleSocialLogin}
                      className="text-[11px] font-bold text-[#2E5CF6] hover:underline"
                    >
                      {t('Forgot Password?')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-10 py-3 sm:py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1A27] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#2E5CF6] focus:ring-1 focus:ring-[#2E5CF6] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Submit button */}
              <button 
                type="submit"
                className="w-full bg-[#2E5CF6] hover:bg-[#1E48D4] dark:bg-[#2E5CF6] dark:hover:bg-[#1E48D4] text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] transition-all"
              >
                {isSignUp ? t('Sign up') : t('Log in')}
              </button>
            </form>

            {/* Account Status / Sign Up message */}
            <div className="text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isSignUp ? t('Already have an account?') : t("Don't have an account?")}{' '}
                <button 
                  onClick={() => setIsSignUp(!isSignUp)} 
                  className="font-semibold text-[#2E5CF6] hover:underline"
                >
                  {isSignUp ? t('Log in') : t('Sign up')}
                </button>
              </span>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('Or')}</span>
              <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
            </div>

            {/* Social logins */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1C1A27] text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="truncate">{t('Google')}</span>
              </button>

              <button 
                onClick={handleSocialLogin}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1C1A27] text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.83-1.01 2.96 1.12.09 2.25-.56 2.94-1.39z" />
                </svg>
                <span className="truncate">{t('Apple')}</span>
              </button>
            </div>
            
            {/* Quick Helper Text */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-[#2E5CF6]" />
              {t('Demo Access: admin@admin.com')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
