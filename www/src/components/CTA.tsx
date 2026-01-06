'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Zap } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 md:p-12 lg:p-16 overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400 border border-blue-500/20 mb-6">
              <Zap className="h-4 w-4" />
              <span>Ready to get started?</span>
            </div>

            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Start Building with <span className="gradient-text">PolyRPC</span>
            </h2>

            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              Get up and running in under 5 minutes. No complex setup required.
            </p>

            {/* Install command */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-3 font-mono text-sm">
              <span className="text-zinc-500">$</span>
              <span className="text-green-400">npm install -g polyrpc</span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/docs/getting-started"
                className="group flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-all hover:bg-blue-700 hover:gap-3"
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="https://github.com/yourusername/polyrpc"
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-8 py-4 font-semibold text-white transition-all hover:bg-zinc-800"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
