'use client';

import { usePlayerStore } from '@/stores/playerStore';
import { useTranslations } from 'next-intl';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type PlayerControlsProps = {
  className?: string;
};

export default function PlayerControls({ className }: PlayerControlsProps) {
  const t = useTranslations('player');
  const { isPlaying, currentTime, duration, togglePlay, seekTo } = usePlayerStore();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  return (
    <div className={`flex items-center gap-3 px-3 py-2 bg-gray-900 ${className ?? ''}`}>
      <button
        onClick={togglePlay}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
        aria-label={isPlaying ? t('pause') : t('play')}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex items-center gap-2">
        <span className="text-white text-xs tabular-nums w-10 text-right">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 accent-pink-500"
        />
        <span className="text-gray-400 text-xs tabular-nums w-10">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
