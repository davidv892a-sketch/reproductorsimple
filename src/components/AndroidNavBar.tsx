import React from 'react';
import { ViewTab } from '../types';
import {
  Music,
  Disc3,
  User,
  Radio,
  ListMusic,
  Folder,
  Heart,
} from 'lucide-react';

interface AndroidNavBarProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  showAndroidFrame: boolean;
  favoritesCount: number;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  activeTab,
  onSelectTab,
  showAndroidFrame,
  favoritesCount,
}) => {
  const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'tracks', label: 'Canciones', icon: <Music className="w-4 h-4" /> },
    { id: 'albums', label: 'Álbumes', icon: <Disc3 className="w-4 h-4" /> },
    { id: 'artists', label: 'Artistas', icon: <User className="w-4 h-4" /> },
    { id: 'genres', label: 'Géneros', icon: <Radio className="w-4 h-4" /> },
    { id: 'playlists', label: 'Playlists', icon: <ListMusic className="w-4 h-4" /> },
    { id: 'folders', label: 'Carpetas', icon: <Folder className="w-4 h-4" /> },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: (
        <div className="relative">
          <Heart className="w-4 h-4" />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <nav className="w-full shrink-0 select-none bg-slate-950/95 backdrop-blur-lg border-t border-white/5 z-20">
      {/* Scrollable Tab bar */}
      <div className="flex items-center overflow-x-auto no-scrollbar py-2 px-2 gap-1 justify-between sm:justify-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[62px] px-2 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Android Bottom Gesture Indicator Bar */}
      {showAndroidFrame && (
        <div className="w-full py-1.5 flex justify-center items-center">
          <div className="w-28 h-1 rounded-full bg-slate-600/60" />
        </div>
      )}
    </nav>
  );
};
