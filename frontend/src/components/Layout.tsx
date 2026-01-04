import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import MiniPlayer from './MiniPlayer';
import { usePlayerStore } from '../stores/playerStore';

export default function Layout() {
  const { currentTrack, currentShow } = usePlayerStore();
  const hasActivePlayer = currentTrack || currentShow;

  return (
    <div className="min-h-screen bg-gradient-radio flex flex-col">
      <main className={`flex-1 overflow-y-auto ${hasActivePlayer ? 'pb-32' : 'pb-20'}`}>
        <Outlet />
      </main>
      {hasActivePlayer && <MiniPlayer />}
      <Navigation />
    </div>
  );
}
