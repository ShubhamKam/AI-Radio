# AI Radio App - Project Plan

## Project Overview
AI Radio is a news aggregation and audio playback application designed to provide users with up-to-date market, economic, and industrial news. The application mimics the visual style of top-tier financial news platforms (referencing Bloomberg style) and features an "AI Radio" capability to listen to articles.

## Tech Stack
- **Frontend Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Icons:** Lucide React / Heroicons
- **Containerization:** Docker

## Features & User Stories

### 1. News Feed (Home)
**Story:** As a user, I want to see a feed of the latest news articles so that I can stay informed.
- **Tasks:**
    - [ ] Initialize Next.js project.
    - [ ] Configure Tailwind CSS.
    - [ ] Create layout component (Header, Navigation, Footer).
    - [ ] Implement `NewsCard` component.
    - [ ] Implement `NewsFeed` container.
    - [ ] Add categories tabs (Latest, Markets, Economics, Industries).

### 2. Market Ticker
**Story:** As a user, I want to see real-time or delayed market data (Stocks, Commodities) at the top of the screen.
- **Tasks:**
    - [ ] Create `MarketTicker` component.
    - [ ] Mock market data structure.
    - [ ] Implement scrolling/carousel animation for ticker.

### 3. Article Detail & Paywall
**Story:** As a user, I want to read full articles, but see a paywall if I am not subscribed.
- **Tasks:**
    - [ ] Create Article Detail page (`[id].tsx`).
    - [ ] Implement `Paywall` component (overlay for non-subscribers).
    - [ ] Create Subscription options UI.

### 4. AI Radio / Audio Player
**Story:** As a user, I want to listen to news articles via an audio player.
- **Tasks:**
    - [ ] Create global `AudioPlayer` component (sticky footer or overlay).
    - [ ] Implement Play/Pause, Skip, Progress controls.
    - [ ] Integrate mock TTS (Text-to-Speech) service or placeholder.

## Dependencies
- `next`
- `react`
- `react-dom`
- `typescript`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `lucide-react` (icons)
- `zustand` (state)
- `clsx`, `tailwind-merge` (style utilities)

## Development Roadmap
1.  **Phase 1: Setup & Infrastructure**
    -   Project initialization.
    -   Docker environment setup.
    -   Basic routing and layout.
2.  **Phase 2: UI Implementation (Home & Feed)**
    -   News cards and feed layout matching screenshots.
    -   Market ticker.
3.  **Phase 3: Article & Paywall**
    -   Article view.
    -   Subscription screen.
4.  **Phase 4: Audio Features**
    -   Audio player UI.
    -   Playback logic.
