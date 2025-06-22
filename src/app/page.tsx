"use client";

import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { DemoAndFeatures } from '@/components/landing/DemoAndFeatures';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';
//import { PixelatedBackground, PixelatedLeft, PixelatedRight } from '@/components/landing/PixelatedEffects';

export default function HomeContent() {
  return (
    <main className="relative flex h-full flex-1 flex-col overflow-x-hidden bg-[#0F0F0F]">
      {/* <PixelatedBackground
        className="z-1 absolute left-1/2 top-[-40px] h-auto w-screen min-w-[1920px] -translate-x-1/2 object-cover"
        style={{
          mixBlendMode: 'screen',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      /> */}
      
      {/* <PixelatedLeft className="absolute left-0 top-[20%] z-0 opacity-30" />
      
      <PixelatedRight className="absolute right-0 top-[60%] z-0 opacity-30" /> */}

      <Navigation />

      <HeroSection />

      <DemoAndFeatures />
      
      <FinalCta />

      <Footer />
    </main>
  );
}
