import Link from 'next/link';

const sidebarLinks = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: '/docs/concepts', label: 'Concepts' },
  { href: '/docs/client', label: 'Client Usage' },
  { href: '/docs/react', label: 'React Integration' },
  { href: '/docs/api-reference', label: 'API Reference' },
  { href: '/docs/examples', label: 'Examples' },
  { href: '/docs/faq', label: 'FAQ' },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-zinc-800 pt-20 px-4 fixed h-full bg-zinc-950">
        <nav className="space-y-1 mt-8">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {children}
      </div>
    </div>
  );
}
