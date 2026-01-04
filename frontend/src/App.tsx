import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HomePage from '@pages/HomePage';
// Import other pages as they are created
// import ArticleDetailPage from '@pages/ArticleDetailPage';
// import MarketsPage from '@pages/MarketsPage';
// import SearchPage from '@pages/SearchPage';
// import ProfilePage from '@pages/ProfilePage';

function App() {
  return (
    <>
      <Helmet>
        <title>AI-Radio News - AI-Powered News Aggregation</title>
        <meta
          name="description"
          content="Stay informed with AI-powered news aggregation. Get the latest news, market data, and intelligent summaries."
        />
      </Helmet>

      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/article/:id" element={<ArticleDetailPage />} /> */}
        {/* <Route path="/markets" element={<MarketsPage />} /> */}
        {/* <Route path="/search" element={<SearchPage />} /> */}
        {/* <Route path="/profile" element={<ProfilePage />} /> */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;
