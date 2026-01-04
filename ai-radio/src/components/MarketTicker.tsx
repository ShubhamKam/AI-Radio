import React from 'react';
import { MARKET_DATA } from '@/lib/data';
import { Triangle } from 'lucide-react';

export default function MarketTicker() {
  return (
    <div className="bg-white py-4 px-4 border-b border-gray-100">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Top Securities</h2>
      <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
        {MARKET_DATA.map((item) => (
          <div key={item.symbol} className="min-w-[140px] bg-gray-900 text-white p-3 rounded-md flex flex-col">
            <span className="text-xs font-semibold text-gray-400 uppercase">{item.name}</span>
            <div className="flex items-end justify-between mt-1">
              <span className="text-sm font-bold">{item.value}</span>
            </div>
            <div className={`flex items-center text-xs mt-1 ${item.isUp ? 'text-green-400' : 'text-red-400'}`}>
              <Triangle className={`w-3 h-3 fill-current ${!item.isUp && 'rotate-180'}`} />
              <span className="ml-1">{item.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
