import React from 'react';
import Image from 'next/image';
import { Article } from '@/lib/data';
import { Headphones, Bookmark } from 'lucide-react';

interface NewsCardProps {
  article: Article;
  variant?: 'hero' | 'list' | 'related' | 'big-take';
}

export default function NewsCard({ article, variant = 'list' }: NewsCardProps) {
  if (variant === 'related') {
    return (
      <div className="py-3 border-b border-gray-100 last:border-0">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{article.title}</h3>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="mb-6">
        <div className="relative aspect-video w-full mb-3">
            {article.imageUrl && (
                <Image 
                    src={article.imageUrl} 
                    alt={article.title}
                    fill
                    className="object-cover"
                />
            )}
        </div>
        <div className="px-4">
            <div className="flex justify-between items-start mb-2">
                 <span className="text-xs text-gray-500">{article.timestamp}</span>
                 <div className="flex space-x-3">
                     {article.isAudioAvailable && <Headphones className="w-5 h-5 text-gray-500" />}
                     <Bookmark className="w-5 h-5 text-gray-500" />
                 </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4">
                {article.title}
            </h2>
        </div>
      </div>
    );
  }
  
  if (variant === 'big-take') {
      return (
          <div className="flex bg-gray-50 p-4 mb-4 rounded-lg">
               <div className="w-20 h-20 relative flex-shrink-0 bg-gray-200 mr-4">
                    {/* Placeholder specifically for Big Take icon style */}
                    {article.imageUrl && <Image src={article.imageUrl} alt="" fill className="object-cover" />}
               </div>
               <div>
                   <span className="text-xs font-bold text-black uppercase tracking-wider">The Big Take</span>
                   <h3 className="text-base font-bold text-gray-900 leading-snug mt-1">{article.title}</h3>
                   <div className="mt-2 text-xs text-gray-500">{article.timestamp}</div>
               </div>
               <div className="ml-auto">
                   <Bookmark className="w-5 h-5 text-gray-400" />
               </div>
          </div>
      )
  }

  // Default list view
  return (
    <div className="flex py-4 border-b border-gray-100 px-4">
      {article.imageUrl && (
        <div className="w-24 h-16 relative flex-shrink-0 mr-4">
          <Image src={article.imageUrl} alt="" fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
             {article.category && article.category !== "Markets" && (
                 <span className="text-xs text-blue-600 font-medium">{article.category}</span>
             )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-3">
          {article.title}
        </h3>
        <div className="flex items-center justify-between">
           <span className="text-xs text-gray-500">{article.timestamp}</span>
           <div className="flex space-x-3">
                {article.isAudioAvailable && <Headphones className="w-4 h-4 text-gray-400" />}
                <Bookmark className="w-4 h-4 text-gray-400" />
           </div>
        </div>
      </div>
    </div>
  );
}
