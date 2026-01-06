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
    <section className="py-24 bg-zinc-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            A Rust-powered pipeline that feels like magic.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                  <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full ${step.color} shadow-lg`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold border border-zinc-700">
                    {index + 1}
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-zinc-400">{step.description}</p>
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
          className="mt-16 rounded-xl border border-zinc-800 bg-zinc-900 p-8 font-mono text-sm"
        >
          <pre className="text-center text-zinc-400 overflow-x-auto">
{`┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Python Files   │────▶│  Rust Sentinel   │────▶│  TypeScript     │
│  (Pydantic)     │     │  (tree-sitter)   │     │  Definitions    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
   You save file          <50ms parse              VS Code sees
   (Ctrl+S)               No Python runtime        new types instantly`}
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
