import React, { useState, useEffect, useRef } from 'react';
import { Post } from '../types';
import { Calendar, Clock, Image as ImageIcon, Send, Facebook, Linkedin, Instagram, Sparkles, Loader2, Trash2, Webhook, Check, AlertTriangle, Play } from 'lucide-react';
import { motion } from 'motion/react';
import XIcon from '../components/XIcon';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';

import { ToastType } from '../components/Toast';

const mockPosts: Omit<Post, 'id'>[] = [
  { content: 'Excited to announce our new feature launch! 🚀 #marketing #growth', platforms: ['facebook', 'twitter'], scheduledDate: new Date(new Date().getTime() + 86400000), status: 'scheduled' },
  { content: 'Behind the scenes at our annual retreat. 🌴', platforms: ['instagram'], scheduledDate: new Date(new Date().getTime() + 172800000), status: 'scheduled' },
];

export default function Scheduler({ addToast }: { addToast?: (msg: string, type: ToastType) => void }) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'compose' | 'scheduled'>('compose');
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook']);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Image and hashtag additions
  const [postImage, setPostImage] = useState<string | null>(null);
  const [showHashtags, setShowHashtags] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [scheduledDate, setScheduledDate] = useState<string>(getTomorrowDateString());
  const [scheduledTime, setScheduledTime] = useState<string>('12:00');

  const platforms = [
    { id: 'facebook', icon: Facebook, color: '#1877F2' },
    { id: 'twitter', icon: XIcon, color: 'var(--color-m3-on-surface)' },
    { id: 'linkedin', icon: Linkedin, color: '#0A66C2' },
    { id: 'instagram', icon: Instagram, color: '#E4405F' },
    { id: 'webhook', icon: Webhook, color: '#4A154B' },
  ];

  const popularHashtags = [
    '#marketing', '#growth', '#branding', '#analytics', 
    '#socialmedia', '#ai', '#seo', '#ecommerce', '#sales', 
    '#business', '#content', '#tech', '#copywriting', '#startup'
  ];

  // Subscribe to user posts from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'posts'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsList: Post[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const dateVal = data.scheduledDate;
        let scheduledDate = new Date();
        if (dateVal) {
          if (typeof dateVal.toDate === 'function') {
            scheduledDate = dateVal.toDate();
          } else {
            scheduledDate = new Date(dateVal);
          }
        }
        postsList.push({
          id: doc.id,
          content: data.content || '',
          platforms: data.platforms || [],
          scheduledDate: scheduledDate,
          status: data.status || 'scheduled',
          image: data.image || null
        });
      });

      // If no posts found, seed the initial mock posts for this specific user
      if (postsList.length === 0) {
        mockPosts.forEach(async (p) => {
          await addDoc(collection(db, 'posts'), {
            userId: user.id,
            content: p.content,
            platforms: p.platforms,
            scheduledDate: Timestamp.fromDate(p.scheduledDate),
            status: p.status,
            image: p.image || null
          });
        });
      } else {
        // Sort posts by date descending
        postsList.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
        setPosts(postsList);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handlePlatformToggle = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast?.(t('Please select an image file.'), 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImage(reader.result as string);
      addToast?.(t('Image uploaded successfully!'), 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast?.(t('Please drop an image file.'), 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
        addToast?.(t('Image uploaded successfully!'), 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHashtagClick = (tag: string) => {
    if (content.includes(tag)) {
      setContent(prev => prev.replace(new RegExp(`\\s*${tag}\\b`, 'g'), '').trim());
    } else {
      setContent(prev => {
        const trimmed = prev.trim();
        return trimmed + (trimmed ? ' ' : '') + tag;
      });
    }
  };

  const handleAIAutocomplete = async () => {
    if (!content.trim() && !postImage) {
      addToast?.(t('Please write a keyword/phrase or upload an image first so AI can generate related copywriting.'), 'error');
      return;
    }

    setIsGenerating(true);
    addToast?.(t('AI copywriting in progress...'), 'info');
    try {
      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          image: postImage,
          lang: lang
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate copy');
      }

      const data = await response.json();
      if (data.copy) {
        setContent(data.copy);
        addToast?.(t('Copywriting successfully generated by AI!'), 'success');
      } else {
        throw new Error('No copywriting received');
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      addToast?.(err.message || t('AI copy generation failed'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!content) {
      addToast?.(t('Please enter some content for the post.'), 'error');
      return;
    }
    if (selectedPlatforms.length === 0) {
      addToast?.(t('Please select at least one platform.'), 'error');
      return;
    }
    if (!user) return;

    if (!scheduledDate || !scheduledTime) {
      addToast?.(t('Please select a valid date and time.'), 'error');
      return;
    }

    try {
      const [year, month, day] = scheduledDate.split('-').map(Number);
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const postDateTime = new Date(year, month - 1, day, hours, minutes);

      if (isNaN(postDateTime.getTime())) {
        addToast?.(t('Please select a valid date and time.'), 'error');
        return;
      }

      await addDoc(collection(db, 'posts'), {
        userId: user.id,
        content: content,
        platforms: selectedPlatforms,
        scheduledDate: Timestamp.fromDate(postDateTime),
        status: 'scheduled',
        image: postImage
      });
      await addNotification('Post successfully scheduled!', 'success');
      setContent('');
      setPostImage(null);
      setShowHashtags(false);
      // Reset date to tomorrow
      setScheduledDate(getTomorrowDateString());
      setScheduledTime('12:00');
    } catch (err) {
      console.error("Error creating post document in Firestore:", err);
      addToast?.(t('Failed to schedule post'), 'error');
    }
  };

  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      addToast?.(t('Post deleted successfully!'), 'info');
    } catch (err) {
      console.error('Delete post error:', err);
      addToast?.(t('Failed to delete post.'), 'error');
    }
  };

  const handlePublishPost = async (postId: string) => {
    if (!user) return;
    setPublishingPostId(postId);
    try {
      const response = await fetch('/api/publish-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: user.id })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        addToast?.(t('Post published successfully to selected platforms!'), 'success');
        addNotification?.(t('Social media post published successfully!'), 'success');
      } else {
        // Build detailed platform outcome message
        let errorMsg = '';
        if (data.logs) {
          errorMsg = Object.entries(data.logs)
            .map(([plat, res]: any) => `${plat}: ${res.message}`)
            .join(', ');
        }
        throw new Error(errorMsg || data.error || t('Some platforms failed to publish. Check details.'));
      }
    } catch (err: any) {
      console.error('Publish post error:', err);
      addToast?.(err.message || t('Failed to publish post.'), 'error');
    } finally {
      setPublishingPostId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* M3 Tabs */}
      <div className="flex border-b border-[var(--color-m3-outline-variant)] mb-6 relative">
        {(['compose', 'scheduled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 sm:flex-none uppercase tracking-wide text-sm font-medium py-4 px-8 relative transition-colors ${
              activeTab === tab 
                ? 'text-[var(--color-m3-primary)]' 
                : 'text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-variant)]'
            }`}
          >
            {tab === 'scheduled' ? `${t('Scheduled')} (${posts.length})` : t('Compose Post')}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-m3-primary)] rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'compose' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-2 space-y-6"
          >
            {/* Outlined Container for Platforms */}
            <div className="rounded-2xl border border-[var(--color-m3-outline-variant)] p-6 bg-[var(--color-m3-surface)]">
              <h3 className="text-sm font-medium text-[var(--color-m3-on-surface-variant)] mb-4">{t('All Platforms')}</h3>
              <div className="flex flex-wrap gap-4">
                {platforms.map(p => {
                  const isActive = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePlatformToggle(p.id)}
                      style={{
                        backgroundColor: isActive ? `${p.color}20` : 'transparent',
                        color: isActive ? p.color : 'var(--color-m3-on-surface-variant)',
                        borderColor: isActive ? p.color : 'var(--color-m3-outline-variant)',
                      }}
                      className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all hover:bg-[var(--color-m3-surface-variant)]`}
                    >
                      <p.icon className="w-6 h-6" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* M3 Filled Text Field variant for Editor */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="bg-[var(--color-m3-surface-variant)] rounded-t-xl rounded-b-md border-b-[2px] border-[var(--color-m3-on-surface-variant)] focus-within:border-[var(--color-m3-primary)] transition-colors overflow-hidden"
            >
              <div className="pt-4 px-4 flex justify-between items-center">
                <label className="text-xs font-medium text-[var(--color-m3-on-surface-variant)]">{t('Post Content')}</label>
                <button 
                  onClick={handleAIAutocomplete}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-m3-primary)] bg-[var(--color-m3-primary)]/10 px-3 py-1 rounded-full hover:bg-[var(--color-m3-primary)]/20 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {isGenerating ? t('Generating...') : t('AI Autocomplete')}
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('Type your post here... (Or drop an image!)')}
                className="w-full h-32 px-4 pb-2 mt-1 bg-transparent border-none resize-none focus:ring-0 text-[var(--color-m3-on-surface)] placeholder-[var(--color-m3-outline)] outline-none"
              />
              
              {/* Display base64 uploaded image inside the composer */}
              {postImage && (
                <div className="px-4 pb-3">
                  <div className="relative inline-block rounded-lg overflow-hidden border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface)] shadow-sm group">
                    <img src={postImage} alt="Post attachment" className="h-16 w-16 object-cover" />
                    <button 
                      onClick={() => setPostImage(null)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {/* Toolbar and hidden input */}
              <div className="px-4 py-2 flex items-center justify-between border-t border-[var(--color-m3-outline-variant)]/30">
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface)]/50 rounded-full transition-colors"
                    title={t('Upload Image')}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowHashtags(prev => !prev)}
                    className={`p-2 rounded-full transition-colors ${showHashtags ? 'bg-[var(--color-m3-primary)]/10 text-[var(--color-m3-primary)]' : 'text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface)]/50'}`}
                    title={t('Popular Hashtags')}
                  >
                    <span className="font-bold text-lg leading-none">#</span>
                  </button>
                </div>
                <div className="text-xs text-[var(--color-m3-on-surface-variant)]">
                  {content.length} / 280
                </div>
              </div>

              {/* Clickable popular hashtags section */}
              {showHashtags && (
                <div className="px-4 pb-3 border-t border-[var(--color-m3-outline-variant)]/50 pt-3 bg-[var(--color-m3-surface)]/50">
                  <p className="text-xs font-medium text-[var(--color-m3-on-surface-variant)] mb-2">{t('Popular Hashtags (click to toggle)')}:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {popularHashtags.map(tag => {
                      const isIncluded = content.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => handleHashtagClick(tag)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                            isIncluded 
                              ? 'bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] border-[var(--color-m3-primary)] shadow-sm' 
                              : 'bg-[var(--color-m3-surface)] text-[var(--color-m3-on-surface-variant)] border-[var(--color-m3-outline-variant)] hover:bg-[var(--color-m3-surface-variant)]'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Info (M3 Elevated Card) */}
            <div className="bg-[var(--color-m3-surface)] rounded-2xl shadow-[var(--shadow-m3-1)] p-4 flex flex-wrap sm:flex-nowrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-[var(--color-m3-on-surface)] bg-[var(--color-m3-surface-variant)] px-4 py-2 rounded-lg hover:bg-[var(--color-m3-outline-variant)]/60 transition cursor-pointer border border-[var(--color-m3-outline-variant)]/30 focus-within:ring-2 focus-within:ring-[var(--color-m3-primary)]">
                  <Calendar className="w-4 h-4 text-[var(--color-m3-primary)] shrink-0" />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="bg-transparent border-0 p-0 text-sm font-medium focus:ring-0 focus:outline-none outline-none cursor-pointer text-[var(--color-m3-on-surface)] w-28"
                  />
                </div>
                <div className="flex items-center gap-2 text-[var(--color-m3-on-surface)] bg-[var(--color-m3-surface-variant)] px-4 py-2 rounded-lg hover:bg-[var(--color-m3-outline-variant)]/60 transition cursor-pointer border border-[var(--color-m3-outline-variant)]/30 focus-within:ring-2 focus-within:ring-[var(--color-m3-primary)]">
                  <Clock className="w-4 h-4 text-[var(--color-m3-primary)] shrink-0" />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="bg-transparent border-0 p-0 text-sm font-medium focus:ring-0 focus:outline-none outline-none cursor-pointer text-[var(--color-m3-on-surface)] w-16"
                  />
                </div>
              </div>
              <button 
                onClick={handleSchedulePost}
                className="bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-transform hover:shadow-md active:scale-95"
              >
                <Send className="w-4 h-4" />
                {t('Schedule')}
              </button>
            </div>
          </motion.div>

          {/* Preview panel */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-[var(--color-m3-surface)] rounded-2xl shadow-[var(--shadow-m3-1)] p-6">
              <h3 className="text-sm font-medium text-[var(--color-m3-on-surface-variant)] mb-4">{t('Post Preview')}</h3>
              <div className="border border-[var(--color-m3-outline-variant)] rounded-xl p-4 bg-[var(--color-m3-surface)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] flex justify-center items-center font-bold">M</div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-m3-on-surface)]">Marketing Pro</p>
                    <p className="text-xs text-[var(--color-m3-on-surface-variant)]">{t('Just now')}</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-m3-on-surface)] whitespace-pre-wrap break-words">
                  {content || <span className="text-[var(--color-m3-outline)]">{t('Start typing to see preview...')}</span>}
                </p>
                {postImage && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface-variant)]">
                    <img src={postImage} alt="Post visual asset preview" className="w-full h-auto max-h-48 object-cover" />
                  </div>
                )}
                {selectedPlatforms.length > 0 && (
                  <div className="mt-4 flex gap-2 pt-4 border-t border-[var(--color-m3-outline-variant)]">
                    {selectedPlatforms.map(p => {
                      const plat = platforms.find(pl => pl.id === p);
                      return plat ? <plat.icon key={p} className="w-4 h-4" style={{ color: plat.color }} /> : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {posts.map((post) => (
            <div key={post.id} className="bg-[var(--color-m3-surface)] p-6 rounded-2xl shadow-[var(--shadow-m3-1)] hover:shadow-[var(--shadow-m3-2)] transition-shadow border border-[var(--color-m3-outline-variant)] flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {post.status === 'published' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      <Check className="w-3.5 h-3.5" />
                      {t('Published')}
                    </span>
                  )}
                  {post.status === 'scheduled' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      {t('Scheduled')}
                    </span>
                  )}
                  {(post.status === 'failed' || post.status === 'partial_failed') && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900" title={post.publishLogs ? Object.entries(post.publishLogs).map(([k, v]: any) => `${k}: ${v.message}`).join(', ') : ''}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {t('Failed')}
                    </span>
                  )}
                </div>

                <p className="text-[var(--color-m3-on-surface)] mb-3 text-base">{post.content}</p>
                {post.image && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-[var(--color-m3-outline-variant)] max-w-sm bg-[var(--color-m3-surface-variant)] shadow-sm">
                    <img src={post.image} alt="Scheduled post image asset" className="w-full h-auto max-h-48 object-cover" />
                  </div>
                )}
                
                {post.publishLogs && (
                  <div className="mb-4 p-3 bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)] rounded-xl text-xs space-y-1">
                    <p className="font-semibold text-[var(--color-m3-on-surface)]">{t('Publication logs:')}</p>
                    {Object.entries(post.publishLogs).map(([plat, res]: any) => (
                      <div key={plat} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${res.success ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span className="font-medium text-[var(--color-m3-on-surface)] capitalize">{plat}:</span>
                        <span className="text-[var(--color-m3-on-surface-variant)]">{res.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-secondary-container)] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--color-m3-primary)]" />
                    {post.scheduledDate.toLocaleDateString()} {post.scheduledDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <div className="flex gap-2">
                    {post.platforms.map(p => {
                      const plat = platforms.find(pl => pl.id === p);
                      return (
                        <span key={p} className="inline-flex items-center gap-1 text-[var(--color-m3-on-surface-variant)] uppercase tracking-wider text-[10px] bg-[var(--color-m3-surface-variant)] px-2 py-1 rounded-md">
                          {plat && <plat.icon className="w-3 h-3" style={{ color: plat.color }} />}
                          {p}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0 justify-end mt-4 sm:mt-0">
                {(post.status === 'scheduled' || post.status === 'failed') && (
                  <button 
                    onClick={() => handlePublishPost(post.id)}
                    disabled={publishingPostId === post.id}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full hover:shadow-md transition-shadow flex items-center gap-1.5"
                  >
                    {publishingPostId === post.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                    {t('Publish Now')}
                  </button>
                )}
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/35 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('Delete')}
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
