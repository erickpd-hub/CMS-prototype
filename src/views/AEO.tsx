import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Globe, Search, RefreshCw, AlertCircle, ArrowRight, CheckCircle2, Bot } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { ViewId } from '../types';
import { ToastType } from '../components/Toast';

interface AEOProps {
  onNavigate: (view: ViewId) => void;
  addToast?: (msg: string, type: ToastType) => void;
}

export default function AEO({ onNavigate, addToast }: AEOProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [isGaConnected, setIsGaConnected] = useState<boolean | null>(null);
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any | null>(null);

  // Check if GA4 (Website) is connected
  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'users', user.id, 'integrations');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      let connected = false;
      snapshot.forEach((docSnap) => {
        if (docSnap.id === 'ga') {
          connected = true;
        }
      });
      setIsGaConnected(connected);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !keyword) return;

    setIsAnalyzing(true);
    // Simulate an AI analysis process for AEO
    setTimeout(() => {
      setResults({
        score: Math.floor(Math.random() * 30) + 60, // 60-90
        aiReadability: 'Good',
        entityClarity: 'Needs Improvement',
        recommendations: [
          t('Structure content with clear H2/H3 headings for AI parsers.'),
          t('Include direct, concise answers to common questions at the top.'),
          t('Use structured data (JSON-LD) to define key entities.'),
          t('Improve keyword density organically without stuffing.')
        ]
      });
      setIsAnalyzing(false);
      addToast?.(t('AEO Analysis complete.'), 'success');
    }, 2000);
  };

  const handleConnectTestPage = async () => {
    if (!user) return;
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'users', user.id, 'integrations', 'ga');
      await setDoc(docRef, {
        measurementId: 'G-TEST123456',
        apiSecret: 'test_secret_key',
        updatedAt: new Date().toISOString()
      });
      addToast?.(t('Test website connected successfully!'), 'success');
    } catch (err) {
      console.error('Error connecting test page:', err);
      addToast?.(t('Failed to connect test website.'), 'error');
    }
  };

  if (isGaConnected === null) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--color-m3-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isGaConnected) {
    return (
      <div className="max-w-4xl mx-auto h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-m3-surface-variant)] p-8 rounded-3xl max-w-lg shadow-[var(--shadow-m3-1)] border border-[var(--color-m3-outline-variant)]"
        >
          <div className="w-20 h-20 bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Globe className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-semibold text-[var(--color-m3-on-surface)] mb-4">
            {t('Website Not Connected')}
          </h2>
          <p className="text-[var(--color-m3-on-surface-variant)] mb-8 leading-relaxed">
            {t('To use the AI Engine Optimization (AEO) module, you must first connect your website or analytics data source.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => onNavigate('integrations')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full font-medium hover:shadow-md transition-shadow w-full sm:w-auto"
            >
              {t('Connect Website')}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={handleConnectTestPage}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-m3-outline)] text-[var(--color-m3-primary)] rounded-full font-medium hover:bg-[var(--color-m3-primary-container)] hover:text-[var(--color-m3-on-primary-container)] transition-colors w-full sm:w-auto"
            >
              {t('Connect Test Website')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--color-m3-on-surface)] tracking-tight">{t('AEO Optimization')}</h1>
          <p className="text-[var(--color-m3-on-surface-variant)] mt-1">{t('Optimize your content for AI Search Engines (ChatGPT, Gemini, Perplexity).')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] border border-[var(--color-m3-outline-variant)]">
            <h2 className="text-lg font-medium text-[var(--color-m3-on-surface)] mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-[var(--color-m3-primary)]" />
              {t('New Analysis')}
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-m3-on-surface)] uppercase tracking-wider mb-1.5">
                  {t('Target URL')}
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/blog-post"
                  className="w-full bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-m3-primary)] outline-none text-[var(--color-m3-on-surface)] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-m3-on-surface)] uppercase tracking-wider mb-1.5">
                  {t('Target Keyword / Entity')}
                </label>
                <input
                  type="text"
                  required
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Digital Marketing Trends 2026"
                  className="w-full bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-m3-primary)] outline-none text-[var(--color-m3-on-surface)] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full font-semibold hover:shadow-md transition-all disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    {t('Analyzing...')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('Generate Insights')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {results ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--color-m3-surface)] p-5 rounded-2xl shadow-sm border border-[var(--color-m3-outline-variant)] text-center">
                  <div className="text-[var(--color-m3-on-surface-variant)] text-xs font-medium uppercase tracking-wider mb-2">{t('AEO Score')}</div>
                  <div className={`text-4xl font-bold ${results.score >= 80 ? 'text-emerald-500' : results.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {results.score}
                  </div>
                  <div className="text-xs text-[var(--color-m3-on-surface-variant)] mt-1">/ 100</div>
                </div>
                <div className="bg-[var(--color-m3-surface)] p-5 rounded-2xl shadow-sm border border-[var(--color-m3-outline-variant)] text-center">
                  <div className="text-[var(--color-m3-on-surface-variant)] text-xs font-medium uppercase tracking-wider mb-2">{t('AI Readability')}</div>
                  <div className="text-lg font-semibold text-[var(--color-m3-on-surface)] flex items-center justify-center gap-2">
                    {results.aiReadability === 'Good' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                    {t(results.aiReadability)}
                  </div>
                </div>
                <div className="bg-[var(--color-m3-surface)] p-5 rounded-2xl shadow-sm border border-[var(--color-m3-outline-variant)] text-center">
                  <div className="text-[var(--color-m3-on-surface-variant)] text-xs font-medium uppercase tracking-wider mb-2">{t('Entity Clarity')}</div>
                  <div className="text-lg font-semibold text-[var(--color-m3-on-surface)] flex items-center justify-center gap-2">
                    {results.entityClarity === 'Good' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                    {t(results.entityClarity)}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] border border-[var(--color-m3-outline-variant)]">
                <h3 className="text-lg font-medium text-[var(--color-m3-on-surface)] mb-4 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[var(--color-m3-primary)]" />
                  {t('AI Engine Recommendations')}
                </h3>
                <ul className="space-y-3">
                  {results.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-m3-surface-variant)] text-sm text-[var(--color-m3-on-surface)]">
                      <div className="mt-0.5 min-w-5 flex justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-m3-primary)] mt-1.5" />
                      </div>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[var(--color-m3-outline-variant)] rounded-3xl bg-[var(--color-m3-surface)]/50">
              <Bot className="w-16 h-16 text-[var(--color-m3-on-surface-variant)] mb-4 opacity-50" />
              <p className="text-[var(--color-m3-on-surface-variant)] text-sm max-w-xs">
                {t('Enter a URL and target keyword to generate AI Engine Optimization insights.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
