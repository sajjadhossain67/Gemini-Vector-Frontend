'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plane, MapPin, DollarSign, Clock, Star, CheckCircle2, X, Mic, LayoutList } from 'lucide-react';
import { useTravelStore } from '@/store/travelStore';

export default function DecisionCard() {
  const activeProposal = useTravelStore((s) => s.activeProposal);
  const bookingStatus = useTravelStore((s) => s.bookingStatus);
  const confirmProposal = useTravelStore((s) => s.confirmProposal);
  const rejectProposal = useTravelStore((s) => s.rejectProposal);
  const agentState = useTravelStore((s) => s.agentState);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <LayoutList size={13} className="text-white/40" />
        <span className="text-xs font-semibold text-white/50 tracking-wider uppercase">Recovery Options</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">

          {/* Booking confirmed */}
          {bookingStatus === 'confirmed' && (
            <motion.div
              key="confirmed"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(48,209,88,0.12), rgba(48,209,88,0.04))',
                border: '1px solid rgba(48,209,88,0.25)',
                boxShadow: '0 0 30px rgba(48,209,88,0.12)',
              }}
            >
              <div className="flex items-start gap-3 p-4">
                <CheckCircle2 size={18} style={{ color: '#30D158', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div className="text-sm font-bold text-white">Booking Confirmed</div>
                  <div className="text-xs text-white/50 mt-0.5">VS025 at 20:00 — Virgin Atlantic</div>
                  <div className="text-xs text-white/35 mt-1">Confirmation sent to your email</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active proposal */}
          {activeProposal && bookingStatus !== 'confirmed' && (
            <motion.div
              key={activeProposal.id}
              initial={{ y: 20, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,159,10,0.25)',
                boxShadow: '0 0 30px rgba(255,159,10,0.06)',
              }}
            >
              {/* Accent top bar */}
              <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,159,10,0.7), transparent)' }} />

              <div className="p-4 flex flex-col gap-3">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(255,159,10,0.3), rgba(255,107,53,0.2))', border: '1px solid rgba(255,159,10,0.3)', boxShadow: '0 0 12px rgba(255,159,10,0.2)' }}>
                      <Plane size={14} style={{ color: '#FFD60A' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{activeProposal.title}</div>
                      {activeProposal.score && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={9} fill="#30D158" style={{ color: '#30D158' }} />
                          <span className="text-[10px] font-bold" style={{ color: '#30D158' }}>{activeProposal.score}/100</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {bookingStatus === 'pending' && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] animate-pulse flex-shrink-0"
                      style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                      Booking
                    </div>
                  )}
                </div>

                {/* Key metrics — 2x2 grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Clock, label: 'Departure', value: activeProposal.departure ?? '—' },
                    { icon: MapPin, label: 'Airport', value: activeProposal.airportCode ?? '—' },
                    { icon: DollarSign, label: 'Price', value: activeProposal.price ? `$${activeProposal.price}` : '—' },
                    { icon: Clock, label: 'ETA', value: activeProposal.etaImpact ? `+${activeProposal.etaImpact}m` : '—', warn: (activeProposal.etaImpact ?? 0) > 30 },
                  ].map(({ icon: Icon, label, value, warn }) => (
                    <div key={label} className="flex flex-col gap-1 px-2.5 py-2 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-1">
                        <Icon size={10} className="text-white/25" />
                        <span className="text-[9px] text-white/30 uppercase tracking-wider">{label}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: warn ? '#FFD60A' : 'rgba(255,255,255,0.88)' }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Detail chips */}
                {Object.keys(activeProposal.details).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(activeProposal.details).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px]"
                        style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)' }}>
                        <span className="text-white/25">{k}:</span>
                        <span className="text-white/65 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={confirmProposal}
                    disabled={bookingStatus === 'pending'}
                    className="flex items-center justify-center gap-2 h-10 rounded-2xl font-semibold text-xs text-white disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #007AFF, #00D4FF)',
                      boxShadow: '0 0 20px rgba(0,122,255,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    <Mic size={13} />
                    Confirm via Voice
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={rejectProposal}
                    disabled={bookingStatus === 'pending'}
                    className="flex items-center justify-center gap-2 h-9 rounded-2xl font-medium text-xs disabled:opacity-50"
                    style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', color: 'rgba(255,59,48,0.75)' }}
                  >
                    <X size={13} />
                    Reject
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Idle state */}
          {!activeProposal && bookingStatus !== 'confirmed' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-48 gap-3 text-center"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Plane size={16} className="text-white/20" />
              </div>
              <div>
                <p className="text-xs text-white/25">No active proposals</p>
                <p className="text-[10px] text-white/15 mt-1">
                  {agentState === 'Searching' ? 'Agent is searching...' : 'Waiting for agent analysis'}
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
