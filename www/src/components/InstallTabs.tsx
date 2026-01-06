'use client';

import { useState } from 'react';

interface InstallTabsProps {
  packages: string;
  dev?: boolean;
}

export function InstallTabs({ packages, dev = false }: InstallTabsProps) {
  const [activeTab, setActiveTab] = useState<'npm' | 'yarn' | 'pnpm' | 'bun'>('npm');

  const commands = {
    npm: `npm install ${dev ? '-D ' : ''}${packages}`,
    yarn: `yarn add ${dev ? '-D ' : ''}${packages}`,
    pnpm: `pnpm add ${dev ? '-D ' : ''}${packages}`,
    bun: `bun add ${dev ? '-d ' : ''}${packages}`,
  };

  const tabs = [
    { id: 'npm' as const, label: 'npm' },
    { id: 'yarn' as const, label: 'Yarn' },
    { id: 'pnpm' as const, label: 'pnpm' },
    { id: 'bun' as const, label: 'Bun' },
  ];

  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-gray-900 p-4">
        <code className="text-sm text-gray-100 font-mono">{commands[activeTab]}</code>
      </div>
    </div>
  );
}
