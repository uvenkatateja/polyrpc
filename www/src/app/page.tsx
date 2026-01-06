'use client';

import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { CodePreview } from '@/components/CodePreview';
import { HowItWorks } from '@/components/HowItWorks';
import { Comparison } from '@/components/Comparison';
import { Testimonials } from '@/components/Testimonials';
import { CTA } from '@/components/CTA';

export default function Home() {
  return (
    <main className="pt-16">
      <Hero />
      <Features />
      <CodePreview />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <CTA />
    </main>
  );
}
