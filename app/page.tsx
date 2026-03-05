'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useTravelStore } from '@/store/travelStore';
import Providers from './providers';
import StatusBanner from '@/components/StatusBanner';
import AgentLogPanel from '@/components/AgentLogPanel';
import TravelMap from '@/components/TravelMap';
import DecisionCard from '@/components/DecisionCard';
import VoiceControls from '@/components/VoiceControls';

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false });
const PulseVisualizer = dynamic(() => import('@/components/PulseVisualizer'), { ssr: false });

function GlassPanel({
  children,
  className = '',
  glow,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay }}
      className={`relative rounded-3xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: `0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)${glow ? `, ${glow}` : ''}`,
      }}
    >
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      <div className="absolute top-4 bottom-4 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="p-4 h-full">{children}</div>
    </motion.div>
  );
}

function ErrorToast() {
  const errorMessage = useTravelStore((s) => s.errorMessage);
  return (
    <AnimatePresence>
      {errorMessage && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-[72px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium"
          style={{
            background: 'linear-gradient(135deg, rgba(255,59,48,0.2), rgba(255,59,48,0.1))',
            border: '1px solid rgba(255,59,48,0.35)',
            backdropFilter: 'blur(20px)',
            color: '#FF6B6B',
            boxShadow: '0 8px 24px rgba(255,59,48,0.2)',
          }}
        >
          <AlertTriangle size={14} />
          {errorMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VectorApp() {
  const startDemo = useTravelStore((s) => s.startDemo);

  useEffect(() => {
    const timer = setTimeout(() => startDemo(), 600);
    return () => clearTimeout(timer);
  }, [startDemo]);

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#050508' }}>
      <ThreeBackground />
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,0,0,0.7) 0%, transparent 80%)' }} />
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(ellipse 80% 30% at 50% 0%, rgba(0,5,15,0.5) 0%, transparent 60%)' }} />
      <ErrorToast />

      <div className="relative z-20 flex flex-col h-full p-3 gap-2.5 md:gap-3">

        <div className="flex-shrink-0">
          <StatusBanner />
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_1.55fr_1fr] lg:grid-cols-[1fr_1.7fr_1fr] gap-2.5 md:gap-3">
          <GlassPanel className="h-full min-h-[200px] md:min-h-0 order-2 md:order-1" delay={0.1}>
            <AgentLogPanel />
          </GlassPanel>
          <GlassPanel className="h-full min-h-[240px] md:min-h-0 order-1 md:order-2" glow="0 0 50px rgba(0,122,255,0.05)" delay={0}>
            <TravelMap />
          </GlassPanel>
          <GlassPanel className="h-full min-h-[200px] md:min-h-0 order-3" delay={0.2}>
            <DecisionCard />
          </GlassPanel>
        </div>

        <div className="flex-shrink-0">
          <GlassPanel className="w-full" glow="0 0 40px rgba(0,122,255,0.06)" delay={0.25}>
            <div className="flex items-center gap-4 h-36 md:h-44">
              <div className="flex-1 h-full min-w-0">
                <PulseVisualizer />
              </div>
              <div className="w-px self-stretch bg-white/[0.06] flex-shrink-0" />
              <div className="flex-shrink-0 flex flex-col items-center justify-center gap-3 pr-1">
                <VoiceControls />
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Providers>
      <VectorApp />
    </Providers>
  );
}
