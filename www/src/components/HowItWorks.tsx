'use client';

import { motion } from 'framer-motion';
import { FileCode, Cpu, FileType, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: FileCode,
    title: 'Write Python',
    description: 'Define your Pydantic models and FastAPI routes as usual.',
    color: 'bg-blue-500',
  },
  {
    icon: Cpu,
    title: 'Rust Parses',
    description: 'The Sentinel watches files and parses Python AST using tree-sitter.',
    color: 'bg-orange-500',
  },
  {
    icon: FileType,
    title: 'Types Generated',
    description: 'TypeScript definitions are written to your frontend in <50ms.',
    color: 'bg-green-500',
  },
  {
    icon: Sparkles,
    title: 'Autocomplete Works',
    description: 'VS Code immediately shows the new types. Full IntelliSense!',
    color: 'bg-purple-500',
  },
];

export function HowItWorks() {
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
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto px-4">
            A Rust-powered pipeline that feels like magic.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 hidden lg:block" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Step number */}
                  <div className={`relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full ${step.color} shadow-lg`}>
                    <step.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  
                  {/* Step number badge */}
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold border border-zinc-700">
                    {index + 1}
                  </div>

                  <h3 className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl font-semibold">{step.title}</h3>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-base text-zinc-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Architecture diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-16 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 lg:p-8 font-mono text-xs sm:text-sm"
        >
          <div className="overflow-x-auto">
            <pre className="text-center text-zinc-400 min-w-[500px]">
{`┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Python Files   │────▶│  Rust Sentinel   │────▶│  TypeScript     │
│  (Pydantic)     │     │  (tree-sitter)   │     │  Definitions    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
   You save file          <50ms parse              VS Code sees
   (Ctrl+S)               No Python runtime        new types instantly`}
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
