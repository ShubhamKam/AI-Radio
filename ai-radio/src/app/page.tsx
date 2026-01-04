import React from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import MarketTicker from '@/components/MarketTicker';
import NewsCard from '@/components/NewsCard';
import AudioPlayer from '@/components/AudioPlayer';
import { ARTICLES } from '@/lib/data';

export default function Home() {
  const heroArticle = ARTICLES[0];
  const relatedArticles = ARTICLES.slice(1, 3);
  const feedArticles = ARTICLES.slice(3);

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />
      <Navigation />
      
      {/* Market Ticker Section (Optional placement) */}
      <MarketTicker />

      <main>
        {/* Hero Section */}
        <section className="pt-4 pb-2">
            <NewsCard article={heroArticle} variant="hero" />
            
            {/* Related Articles Block */}
            <div className="px-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Related</h3>
                    {relatedArticles.map(article => (
                        <NewsCard key={article.id} article={article} variant="related" />
                    ))}
                </div>
            </div>
        </section>

        <hr className="border-gray-100 mb-2" />

        {/* Feed Section */}
        <section>
            {feedArticles.map(article => {
                if (article.category === "The Big Take") {
                    return (
                        <div key={article.id} className="px-4">
                            <NewsCard article={article} variant="big-take" />
                        </div>
                    );
                }
                return <NewsCard key={article.id} article={article} variant="list" />;
            })}
        </section>
      </main>
      
      <AudioPlayer />
    </div>
  );
}
