'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "PolyRPC is exactly what I needed. I can keep my FastAPI backend and still get the tRPC-like experience on the frontend.",
    author: "AI Engineer",
    role: "Building with Python + React",
  },
  {
    quote: "The <50ms type updates are insane. It feels like the types are already there before I even switch tabs.",
    author: "Full Stack Developer",
    role: "FastAPI + Next.js",
  },
  {
    quote: "Finally, I don't have to manually sync my Pydantic models with TypeScript interfaces. This saves hours every week.",
    author: "Backend Developer",
    role: "Python enthusiast",
  },
];

export function Testimonials() {
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
            Loved by <span className="gradient-text">Developers</span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Join the growing community of Python + TypeScript developers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <p className="text-zinc-300 italic">"{testimonial.quote}"</p>
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-zinc-500">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
