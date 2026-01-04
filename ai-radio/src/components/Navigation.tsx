import React from 'react';

const TABS = ["Top News", "Latest", "Markets", "Economics", "Industries", "Technology", "Politics"];

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-14 z-40">
      <div className="flex overflow-x-auto no-scrollbar">
        {TABS.map((tab, index) => (
          <button
            key={tab}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              index === 2 ? 'text-black border-b-2 border-black' : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}
