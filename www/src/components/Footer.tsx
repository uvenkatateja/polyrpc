import Link from 'next/link';
import { Github, Twitter, Zap } from 'lucide-react';

const footerLinks = {
  docs: [
    { href: '/docs', label: 'Documentation' },
    { href: '/docs/getting-started', label: 'Getting Started' },
    { href: '/docs/concepts', label: 'Concepts' },
    { href: '/docs/api-reference', label: 'API Reference' },
  ],
  resources: [
    { href: '/docs/examples', label: 'Examples' },
    { href: '/docs/faq', label: 'FAQ' },
    { href: 'https://github.com/yourusername/polyrpc', label: 'GitHub' },
  ],
  community: [
    { href: 'https://github.com/yourusername/polyrpc/issues', label: 'Issues' },
    { href: 'https://github.com/yourusername/polyrpc/discussions', label: 'Discussions' },
    { href: 'https://twitter.com/polyrpc', label: 'Twitter' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Zap className="h-6 w-6 text-yellow-400" />
              <span className="gradient-text">PolyRPC</span>
            </Link>
            <p className="text-zinc-400 text-sm">
              The invisible bridge between Python and TypeScript.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="https://github.com/yourusername/polyrpc" className="text-zinc-400 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/polyrpc" className="text-zinc-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Docs */}
          <div>
            <h3 className="font-semibold mb-4">Documentation</h3>
            <ul className="space-y-2">
              {footerLinks.docs.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-400 hover:text-white text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-400 hover:text-white text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-400 hover:text-white text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-400 text-sm">
          <p>© 2026 PolyRPC. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
