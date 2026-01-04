import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  RadioIcon,
  FolderIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  RadioIcon as RadioIconSolid,
  FolderIcon as FolderIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
} from '@heroicons/react/24/solid';

const navItems = [
  { path: '/', label: 'Home', Icon: HomeIcon, IconActive: HomeIconSolid },
  { path: '/radio', label: 'Radio', Icon: RadioIcon, IconActive: RadioIconSolid },
  { path: '/upload', label: 'Add', Icon: PlusCircleIcon, IconActive: PlusCircleIconSolid },
  { path: '/library', label: 'Library', Icon: FolderIcon, IconActive: FolderIconSolid },
  { path: '/search', label: 'Search', Icon: MagnifyingGlassIcon, IconActive: MagnifyingGlassIconSolid },
];

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-radio-darker/95 backdrop-blur-lg border-t border-white/10 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ path, label, Icon, IconActive }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${
                isActive ? 'text-radio-accent' : 'text-white/60 hover:text-white/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <IconActive className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
                <span className="text-xs mt-1 font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
