'use client';

import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

const comparisons = [
  {
    feature: 'Backend Language',
    manual: 'Any',
    openapi: 'Any',
    trpc: 'TypeScript Only',
    polyrpc: 'Python',
  },
  {
    feature: 'Update Speed',
    manual: 'Manual',
    openapi: 'Slow (~5s)',
    trpc: 'Instant',
    polyrpc: 'Instant (<50ms)',
  },
  {
    feature: 'Workflow',
    manual: 'Copy-paste',
    openapi: 'Build step',
    trpc: 'Implicit',
    polyrpc: 'Implicit',
  },
  {
    feature: 'Type Safety',
    manual: 'Error-prone',
    openapi: 'Generated',
    trpc: 'Full',
    polyrpc: 'Full',
  },
  {
    feature: 'DX',
    manual: '😢',
    openapi: '😐',
    trpc: '🤩',
    polyrpc: '🤩',
  },
];

export function Comparison() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            How Does It <span className="gradient-text">Compare</span>?
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            PolyRPC fills the gap that no other tool addresses.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="py-4 px-4 text-left text-zinc-400 font-medium">Feature</th>
                <th className="py-4 px-4 text-center text-zinc-400 font-medium">Manual</th>
                <th className="py-4 px-4 text-center text-zinc-400 font-medium">OpenAPI</th>
                <th className="py-4 px-4 text-center text-zinc-400 font-medium">tRPC</th>
                <th className="py-4 px-4 text-center font-medium">
                  <span className="gradient-text">PolyRPC</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, index) => (
                <tr key={row.feature} className="border-b border-zinc-800/50">
                  <td className="py-4 px-4 font-medium">{row.feature}</td>
                  <td className="py-4 px-4 text-center text-zinc-400">{row.manual}</td>
                  <td className="py-4 px-4 text-center text-zinc-400">{row.openapi}</td>
                  <td className="py-4 px-4 text-center text-zinc-400">{row.trpc}</td>
                  <td className="py-4 px-4 text-center text-green-400 font-medium">{row.polyrpc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-zinc-400">
            <span className="text-white font-semibold">tRPC is amazing</span> — but it requires a TypeScript backend.
            <br />
            <span className="gradient-text font-semibold">PolyRPC</span> brings the same magic to Python developers.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
