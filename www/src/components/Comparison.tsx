'use client';

import { motion } from 'framer-motion';

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
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold lg:text-4xl">
            How Does It <span className="gradient-text">Compare</span>?
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto px-4">
            PolyRPC fills the gap that no other tool addresses.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto rounded-xl border border-zinc-800"
        >
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="py-3 sm:py-4 px-3 sm:px-4 text-left text-zinc-400 font-medium text-xs sm:text-sm">Feature</th>
                <th className="py-3 sm:py-4 px-3 sm:px-4 text-center text-zinc-400 font-medium text-xs sm:text-sm">Manual</th>
                <th className="py-3 sm:py-4 px-3 sm:px-4 text-center text-zinc-400 font-medium text-xs sm:text-sm">OpenAPI</th>
                <th className="py-3 sm:py-4 px-3 sm:px-4 text-center text-zinc-400 font-medium text-xs sm:text-sm">tRPC</th>
                <th className="py-3 sm:py-4 px-3 sm:px-4 text-center font-medium text-xs sm:text-sm">
                  <span className="gradient-text">PolyRPC</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row) => (
                <tr key={row.feature} className="border-b border-zinc-800/50">
                  <td className="py-3 sm:py-4 px-3 sm:px-4 font-medium text-xs sm:text-sm">{row.feature}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-center text-zinc-400 text-xs sm:text-sm">{row.manual}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-center text-zinc-400 text-xs sm:text-sm">{row.openapi}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-center text-zinc-400 text-xs sm:text-sm">{row.trpc}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-center text-green-400 font-medium text-xs sm:text-sm">{row.polyrpc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-12 text-center px-4"
        >
          <p className="text-base sm:text-lg text-zinc-400">
            <span className="text-white font-semibold">tRPC is amazing</span> — but it requires a TypeScript backend.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <span className="gradient-text font-semibold">PolyRPC</span> brings the same magic to Python developers.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
