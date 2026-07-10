import React from 'react';
import { motion } from 'motion/react';

// Common base shimmering skeleton pulse
interface SkeletonPulseProps {
  key?: React.Key;
  className?: string;
  variant?: 'circle' | 'rect' | 'text';
}

export function SkeletonPulse({ className = '', variant = 'rect' }: SkeletonPulseProps) {
  const roundedClass = 
    variant === 'circle' ? 'rounded-full' : 
    variant === 'text' ? 'rounded-md h-4' : 
    'rounded-3xl';

  return (
    <div 
      className={`relative overflow-hidden bg-[var(--color-m3-surface-variant)] opacity-40 animate-pulse ${roundedClass} ${className}`}
    >
      <div 
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)'
        }}
      />
    </div>
  );
}

// 1. Dashboard Skeleton View
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 relative pb-20">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <SkeletonPulse variant="text" className="w-1/2" />
                <SkeletonPulse variant="rect" className="h-8 w-2/3" />
              </div>
              <SkeletonPulse variant="circle" className="w-12 h-12" />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <SkeletonPulse variant="text" className="w-1/4" />
              <SkeletonPulse variant="text" className="w-1/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] space-y-6">
          <div className="flex justify-between items-center">
            <SkeletonPulse variant="text" className="w-1/3 h-6" />
            <SkeletonPulse variant="rect" className="w-24 h-10 rounded-lg" />
          </div>
          <SkeletonPulse variant="rect" className="h-72 w-full rounded-2xl" />
        </div>

        <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] space-y-6">
          <div className="flex justify-between items-center">
            <SkeletonPulse variant="text" className="w-1/2 h-6" />
            <SkeletonPulse variant="circle" className="w-6 h-6" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-[var(--color-m3-outline)]/20 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    <SkeletonPulse variant="circle" className="w-5 h-5" />
                    <SkeletonPulse variant="circle" className="w-5 h-5" />
                  </div>
                  <SkeletonPulse variant="text" className="w-16" />
                </div>
                <SkeletonPulse variant="text" className="w-11/12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Campaigns Skeleton View
export function CampaignsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 flex-1">
          <SkeletonPulse variant="text" className="w-1/4 h-8" />
          <SkeletonPulse variant="text" className="w-1/2 h-4" />
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <SkeletonPulse variant="rect" className="w-full sm:w-48 h-12 rounded-full" />
          <SkeletonPulse variant="rect" className="w-12 h-12 rounded-full" />
        </div>
      </div>

      {/* Campaigns list skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] border border-[var(--color-m3-outline)]/10 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <SkeletonPulse variant="text" className="w-3/4 h-5" />
                <SkeletonPulse variant="text" className="w-1/3" />
              </div>
              <SkeletonPulse variant="circle" className="w-10 h-10" />
            </div>

            <div className="grid grid-cols-3 gap-4 py-2 border-y border-[var(--color-m3-outline)]/10">
              {[1, 2, 3].map((j) => (
                <div key={j} className="text-center space-y-1">
                  <SkeletonPulse variant="text" className="w-1/2 mx-auto" />
                  <SkeletonPulse variant="text" className="w-2/3 mx-auto h-5" />
                </div>
              ))}
            </div>

            <div className="space-y-2 bg-[var(--color-m3-surface-variant)]/20 p-4 rounded-2xl">
              <div className="flex items-center space-x-2">
                <SkeletonPulse variant="circle" className="w-5 h-5" />
                <SkeletonPulse variant="text" className="w-1/4" />
              </div>
              <SkeletonPulse variant="text" className="w-full" />
              <SkeletonPulse variant="text" className="w-5/6" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <SkeletonPulse variant="text" className="w-1/4" />
              <SkeletonPulse variant="rect" className="w-24 h-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Scheduler Skeleton View
export function SchedulerSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <SkeletonPulse variant="text" className="w-48 h-8" />
          <SkeletonPulse variant="text" className="w-72 h-4" />
        </div>
        <SkeletonPulse variant="rect" className="w-48 h-12 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Composer / Left Block */}
        <div className="lg:col-span-7 bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] space-y-6">
          <SkeletonPulse variant="text" className="w-1/3 h-6" />
          <SkeletonPulse variant="rect" className="h-40 w-full rounded-2xl" />
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((p) => (
                <SkeletonPulse key={p} variant="circle" className="w-10 h-10" />
              ))}
            </div>
            <SkeletonPulse variant="rect" className="w-24 h-8 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SkeletonPulse variant="rect" className="h-12 rounded-2xl" />
            <SkeletonPulse variant="rect" className="h-12 rounded-2xl" />
          </div>

          <SkeletonPulse variant="rect" className="h-12 w-full rounded-full" />
        </div>

        {/* Preview / Right Block */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] space-y-4">
            <SkeletonPulse variant="text" className="w-1/2 h-6" />
            <div className="border border-[var(--color-m3-outline)]/20 rounded-2xl p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <SkeletonPulse variant="circle" className="w-10 h-10" />
                <div className="flex-1 space-y-1">
                  <SkeletonPulse variant="text" className="w-1/3 h-4" />
                  <SkeletonPulse variant="text" className="w-1/4 h-3" />
                </div>
              </div>
              <SkeletonPulse variant="rect" className="h-44 w-full rounded-xl" />
              <SkeletonPulse variant="text" className="w-11/12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Analytics Skeleton View
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <SkeletonPulse variant="rect" className="w-64 h-12 rounded-full" />
        <SkeletonPulse variant="rect" className="w-32 h-10 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] space-y-3">
            <div className="flex justify-between items-center">
              <SkeletonPulse variant="text" className="w-1/2" />
              <SkeletonPulse variant="circle" className="w-8 h-8" />
            </div>
            <SkeletonPulse variant="text" className="w-1/3 h-7" />
            <SkeletonPulse variant="text" className="w-2/3" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] space-y-4">
            <SkeletonPulse variant="text" className="w-1/3 h-6" />
            <SkeletonPulse variant="rect" className="h-64 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. Integrations Skeleton View
export function IntegrationsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="space-y-1">
        <SkeletonPulse variant="text" className="w-48 h-8" />
        <SkeletonPulse variant="text" className="w-72 h-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] border border-[var(--color-m3-outline)]/10 flex items-center space-x-4">
            <SkeletonPulse variant="circle" className="w-16 h-16 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse variant="text" className="w-1/3 h-5" />
              <SkeletonPulse variant="text" className="w-3/4 h-3" />
              <SkeletonPulse variant="text" className="w-1/2 h-3" />
            </div>
            <SkeletonPulse variant="rect" className="w-24 h-10 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Users / Team Skeleton View
export function UsersSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <SkeletonPulse variant="text" className="w-48 h-8" />
          <SkeletonPulse variant="text" className="w-72 h-4" />
        </div>
        <SkeletonPulse variant="rect" className="w-36 h-12 rounded-full" />
      </div>

      <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 shadow-[var(--shadow-m3-1)] overflow-hidden">
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-[var(--color-m3-outline)]/10">
            <SkeletonPulse variant="text" className="col-span-4 w-1/3" />
            <SkeletonPulse variant="text" className="col-span-3 w-1/4" />
            <SkeletonPulse variant="text" className="col-span-3 w-1/4" />
            <SkeletonPulse variant="text" className="col-span-2 w-1/3" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4 py-3 items-center">
              <div className="col-span-4 flex items-center space-x-3">
                <SkeletonPulse variant="circle" className="w-10 h-10 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <SkeletonPulse variant="text" className="w-2/3 h-4" />
                  <SkeletonPulse variant="text" className="w-1/2 h-3" />
                </div>
              </div>
              <SkeletonPulse variant="rect" className="col-span-3 w-20 h-6 rounded-full" />
              <SkeletonPulse variant="text" className="col-span-3 w-2/3" />
              <div className="col-span-2 flex space-x-2">
                <SkeletonPulse variant="circle" className="w-8 h-8" />
                <SkeletonPulse variant="circle" className="w-8 h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Global Layout-level router for any view's matching skeleton
export function ViewSkeleton({ view }: { view: string }) {
  switch (view) {
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'campaigns':
      return <CampaignsSkeleton />;
    case 'scheduler':
      return <SchedulerSkeleton />;
    case 'analytics':
      return <AnalyticsSkeleton />;
    case 'integrations':
      return <IntegrationsSkeleton />;
    case 'users':
      return <UsersSkeleton />;
    default:
      return (
        <div className="space-y-6 max-w-5xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <SkeletonPulse variant="text" className="w-1/3 h-8" />
            <SkeletonPulse variant="rect" className="w-24 h-10 rounded-full" />
          </div>
          <SkeletonPulse variant="rect" className="h-64 w-full" />
          <div className="space-y-3">
            <SkeletonPulse variant="text" className="w-full" />
            <SkeletonPulse variant="text" className="w-5/6" />
            <SkeletonPulse variant="text" className="w-2/3" />
          </div>
        </div>
      );
  }
}
