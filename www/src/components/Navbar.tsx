'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Github, Zap } from 'lucide-react';

const navLinks = [
  { href: '/docs', label: 'Docs' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: 'https://github.com/uvenkatateja/polyrpc', label: 'GitHub', external: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            <span className="gradient-text">PolyRPC</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm lg:text-base"
              >
                {link.label}
                {link.external && <Github className="h-4 w-4" />}
              </Link>
            ))}
            <Link
              href="/docs/getting-started"
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-medium transition-colors text-sm lg:text-base"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-2 py-3 text-zinc-400 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.external && <Github className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
            <Link
              href="/docs/getting-started"
              className="block mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition-colors text-center"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
