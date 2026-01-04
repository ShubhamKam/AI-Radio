import React from 'react';
import { Search, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="w-6">
            {/* Placeholder for menu or empty */}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-black">Bloomberg</h1>
        <button className="p-2">
          <Search className="w-6 h-6 text-black" />
        </button>
      </div>
    </header>
  );
}
