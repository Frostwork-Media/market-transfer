'use client';

import React, { useState, useEffect } from 'react';

const pages = [
  { name: 'Automate Betting', href: '/' },
  { name: 'Market Creator', href: '/market-creator' },
  { name: 'Market Mover', href: '/market-mover' },
  { name: 'GPT4Casting', href: '/gpt4casting' },
  { name: 'EML', href: 'https://probability-graph.predictionlab.org/' },
];

export default function Navbar() {
  const [activePage, setActivePage] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActivePage(window.location.pathname);
    }
  }, []);

  return (
    <nav className="flex items-center justify-center space-x-8 bg-gray-100 p-6">
      {pages.map((page, i) => {
        const isActive = activePage === page.href;
        return (
          <a
            key={i}
            href={page.href}
            className={`capitalize ${isActive ? 'bg-blue-400 rounded-lg px-2 text-white' : ''}`}
          >
            {page.name}
          </a>
        );
      })}
    </nav>
  );
}