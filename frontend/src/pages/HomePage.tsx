function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Bloomberg</h1>
        </div>
      </header>
      
      <nav className="bg-white border-b">
        <div className="container mx-auto">
          <div className="flex space-x-6 p-4 overflow-x-auto">
            <button className="whitespace-nowrap font-medium border-b-2 border-black pb-2">
              Top News
            </button>
            <button className="whitespace-nowrap text-gray-600 hover:text-black">
              Latest
            </button>
            <button className="whitespace-nowrap text-gray-600 hover:text-black">
              Markets
            </button>
            <button className="whitespace-nowrap text-gray-600 hover:text-black">
              Economics
            </button>
            <button className="whitespace-nowrap text-gray-600 hover:text-black">
              Industries
            </button>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto p-4">
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold mb-4">Welcome to AI-Radio News</h2>
          <p className="text-gray-600 mb-8">
            AI-powered news aggregation platform inspired by Bloomberg
          </p>
          <p className="text-sm text-gray-500">
            Setup the backend and configure your API keys to start seeing news articles here.
          </p>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
