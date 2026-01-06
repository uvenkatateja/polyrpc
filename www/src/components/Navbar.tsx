'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Github, Zap } from 'lucide-react';

const navLinks = [
  { href: '/docs', label: 'Docs' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: '/docs/examples', label: 'Examples' },
  { href: 'https://github.com/yourusername/polyrpc', label: 'GitHub', external: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Zap className="h-6 w-6 text-yellow-400" />
            <span className="gradient-text">PolyRPC</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              >
                {link.label}
                {link.external && <Github className="h-4 w-4" />}
              </Link>
            ))}
            <Link
              href="/docs/getting-started"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                className="block py-2 text-zinc-400 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
