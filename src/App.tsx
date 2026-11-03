import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { Music, VolumeX, Heart } from 'lucide-react';
import { Toaster } from 'sonner';

import { EnvelopeOpening } from './components/EnvelopeOpening';
import { Hero } from './components/Hero';
import { WEDDING } from './config';

// Below-the-fold sections are split into separate chunks so the first screen loads fast.
const CoupleDetails = lazy(() => import('./components/CoupleDetails').then((m) => ({ default: m.CoupleDetails })));
const CeremonyDetails = lazy(() => import('./components/CeremonyDetails').then((m) => ({ default: m.CeremonyDetails })));
const Location = lazy(() => import('./components/Location').then((m) => ({ default: m.Location })));
const Timeline = lazy(() => import('./components/Timeline').then((m) => ({ default: m.Timeline })));
const Countdown = lazy(() => import('./components/Countdown').then((m) => ({ default: m.Countdown })));
const RSVPForm = lazy(() => import('./components/RSVPForm').then((m) => ({ default: m.RSVPForm })));
const WishesSection = lazy(() => import('./components/WishesSection').then((m) => ({ default: m.WishesSection })));

const weddingDate = new Date(WEDDING.dateISO);

export default function App() {
  const [showInvitation, setShowInvitation] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Warm up the lazy chunks while the guest is looking at the envelope.
  useEffect(() => {
    const t = setTimeout(() => {
      import('./components/CoupleDetails');
      import('./components/CeremonyDetails');
      import('./components/Location');
      import('./components/Timeline');
      import('./components/Countdown');
      import('./components/RSVPForm');
      import('./components/WishesSection');
    }, 1200);
    return () => {
      clearTimeout(t);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Audio is only created/downloaded when the guest opens the envelope.
  const handleMusicStart = () => {
    if (!audioRef.current) {
      const audio = new Audio('/paulyudin-wedding-485932.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
    }
    audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => setIsMusicPlaying(false));
  };

  const toggleMusic = () => {
    if (!audioRef.current) return handleMusicStart();
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      handleMusicStart();
    }
  };

  if (!showInvitation) {
    return (
      <EnvelopeOpening
        onComplete={() => setShowInvitation(true)}
        onMusicStart={handleMusicStart}
      />
    );
  }

  return (
    <div className="font-sans text-stone-800 bg-brand-ivory overflow-hidden selection:bg-brand-beige-deep/20">
      <Toaster position="top-center" />

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 1 }}
        onClick={toggleMusic}
        aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
        className="fixed top-6 right-6 z-50 w-12 sm:w-14 h-12 sm:h-14 bg-white/70 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(176,137,104,0.15)] flex items-center justify-center border border-brand-beige/50 text-brand-beige-deep hover:scale-105 transition-all duration-300"
      >
        {isMusicPlaying ? <Music className="w-5 h-5 sm:w-6 sm:h-6" /> : <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />}
      </motion.button>

      <Hero />

      <Suspense fallback={<div className="min-h-screen" />}>
        <div className="py-24 sm:py-32 bg-gradient-to-b from-brand-ivory via-white to-brand-ivory relative">
          <CoupleDetails />
        </div>

        <div className="py-24 sm:py-32 bg-white relative">
          <CeremonyDetails />
        </div>

        <div className="py-24 sm:py-32 bg-gradient-to-b from-white via-brand-champagne/30 to-brand-ivory relative">
          <Location />
        </div>

        <div className="py-24 sm:py-32 bg-brand-ivory relative">
          <Timeline />
        </div>

        <div className="py-24 sm:py-32 bg-gradient-to-b from-white to-brand-ivory relative">
          <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
            <span className="text-brand-beige-deep uppercase tracking-[0.4em] text-[10px] sm:text-[11px] font-bold drop-shadow-sm">
              The Wait Is Almost Over
            </span>
          </div>
          <Countdown targetDate={weddingDate} />
        </div>

        <div className="py-24 sm:py-32 bg-brand-ivory relative">
          <RSVPForm />
        </div>

        <div className="py-24 sm:py-32 bg-gradient-to-b from-brand-ivory to-white relative mt-10">
          <WishesSection />
        </div>
      </Suspense>

      <footer className="py-12 bg-white border-t border-brand-beige/20 text-center relative overflow-hidden mt-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-beige/10 blur-[80px] rounded-full pointer-events-none" />
        <Heart className="w-6 h-6 mx-auto mb-6 text-brand-beige-deep fill-brand-beige/20" />
        <p className="font-display text-4xl sm:text-5xl text-stone-800 mb-2">
          {WEDDING.brideName} &amp; {WEDDING.groomName}
        </p>
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] font-sans text-stone-400 font-semibold block mb-8">
          {WEDDING.dateLong}
        </span>
      </footer>
    </div>
  );
}
