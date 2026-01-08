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
    { href: 'https://github.com/uvenkatateja/polyrpc', label: 'GitHub' },
  ],
  community: [
    { href: 'https://github.com/uvenkatateja/polyrpc/issues', label: 'Issues' },
    { href: 'https://github.com/uvenkatateja/polyrpc/discussions', label: 'Discussions' },
    { href: 'https://twitter.com/polyrpc', label: 'Twitter' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl mb-3 sm:mb-4">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              <span className="gradient-text">PolyRPC</span>
            </Link>
            <p className="text-zinc-400 text-xs sm:text-sm">
              The invisible bridge between Python and TypeScript.
            </p>
            <div className="flex gap-4 mt-3 sm:mt-4">
              <a 
                href="https://github.com/uvenkatateja/polyrpc" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a 
                href="https://twitter.com/polyrpc" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Docs */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Documentation</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.docs.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-400 hover:text-white text-xs sm:text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-zinc-400 hover:text-white text-xs sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Community</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-zinc-400 hover:text-white text-xs sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-zinc-800 text-center text-zinc-400 text-xs sm:text-sm">
          <p>© 2026 PolyRPC. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
