'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Zap, Clock } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400 border border-blue-500/20 mb-8"
          >
            <Zap className="h-4 w-4" />
            <span>Real-time type inference in &lt;100ms</span>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">The Invisible Bridge</span>
            <span className="block mt-2">
              between{' '}
              <span className="text-blue-400">Python</span>
              {' '}and{' '}
              <span className="text-green-400">TypeScript</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Get the <span className="text-white font-semibold">tRPC experience</span> without abandoning Python.
            Edit your Pydantic model, save, and TypeScript types update instantly.
          </p>

          {/* Stats */}
          <div className="mt-8 flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">&lt;50ms</div>
              <div className="text-sm text-zinc-500">Parse time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">0</div>
              <div className="text-sm text-zinc-500">Build steps</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">100%</div>
              <div className="text-sm text-zinc-500">Type safe</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/docs/getting-started"
              className="group flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:gap-3"
            >
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="https://github.com/yourusername/polyrpc"
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-3 font-semibold text-white transition-all hover:bg-zinc-800"
            >
              <Github className="h-5 w-5" />
              Star on GitHub
            </Link>
          </div>

          {/* Terminal preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-16 mx-auto max-w-3xl"
          >
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl glow overflow-hidden">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-sm text-zinc-500">terminal</span>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="text-zinc-500">$ polyrpc watch</div>
                <div className="mt-2 text-yellow-400">⚡ PolyRPC Sentinel</div>
                <div className="text-zinc-400">👁 Watching backend → frontend/src/polyrpc.d.ts</div>
                <div className="text-zinc-400">→ Watching for changes...</div>
                <div className="mt-2 text-cyan-400">⚡ backend/models.py</div>
                <div className="text-green-400">✓ Types updated in 47ms</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
