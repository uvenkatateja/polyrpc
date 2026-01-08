'use client';

import { motion } from 'framer-motion';
import { Zap, RefreshCw, Shield, Code2, Boxes, Rocket } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'Rust-powered parsing completes in <50ms. Your types update before you can blink.',
    color: 'text-yellow-400',
  },
  {
    icon: RefreshCw,
    title: 'Real-time Updates',
    description: 'File watcher detects changes instantly. No manual commands or build steps needed.',
    color: 'text-blue-400',
  },
  {
    icon: Shield,
    title: '100% Type Safe',
    description: 'Full TypeScript inference from your Python models. Catch errors at compile time.',
    color: 'text-green-400',
  },
  {
    icon: Code2,
    title: 'Python First',
    description: 'Keep your FastAPI/Pydantic backend. No need to rewrite in TypeScript.',
    color: 'text-purple-400',
  },
  {
    icon: Boxes,
    title: 'Zero Config',
    description: 'Works out of the box. Just run polyrpc init and start coding.',
    color: 'text-pink-400',
  },
  {
    icon: Rocket,
    title: 'DX Focused',
    description: 'tRPC-like API with useQuery and useMutation hooks. Feels like magic.',
    color: 'text-orange-400',
  },
];

export function Features() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-zinc-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold lg:text-4xl">
            Why <span className="gradient-text">PolyRPC</span>?
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto px-4">
            Built for developers who love Python but need TypeScript on the frontend.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 hover:border-zinc-700 transition-colors"
            >
              <div className={`inline-flex rounded-lg bg-zinc-800 p-2.5 sm:p-3 ${feature.color}`}>
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold">{feature.title}</h3>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-zinc-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
