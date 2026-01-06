import Link from 'next/link';
import { ArrowRight, Book, Code, Zap, HelpCircle } from 'lucide-react';

const sections = [
  {
    title: 'Getting Started',
    description: 'Get up and running with PolyRPC in under 5 minutes.',
    href: '/docs/getting-started',
    icon: Zap,
  },
  {
    title: 'Concepts',
    description: 'Understand how PolyRPC works under the hood.',
    href: '/docs/concepts',
    icon: Book,
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation for all packages.',
    href: '/docs/api-reference',
    icon: Code,
  },
  {
    title: 'FAQ',
    description: 'Frequently asked questions and troubleshooting.',
    href: '/docs/faq',
    icon: HelpCircle,
  },
];

export default function DocsPage() {
  return (
    <main className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold">Documentation</h1>
        <p className="mt-4 text-lg text-zinc-400">
          Everything you need to know about PolyRPC.
        </p>

        <div className="mt-12 grid gap-6">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="rounded-lg bg-zinc-800 p-3 text-blue-400">
                <section.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                  {section.title}
                </h2>
                <p className="mt-1 text-zinc-400">{section.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
