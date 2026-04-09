'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { useTranslations } from 'next-intl';

type VideoPlayerProps = {
  className?: string;
};

export default function VideoPlayer({ className }: VideoPlayerProps) {
  const t = useTranslations('player');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { videoUrl, setVideoElement, setCurrentTime, setDuration, setIsPlaying } =
    usePlayerStore();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    setVideoElement(el);
    return () => setVideoElement(null);
  }, [setVideoElement]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoUrl) return;
    el.src = videoUrl;
    el.load();
  }, [videoUrl]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => setIsPlaying(false);

  return (
    <div className={`relative bg-black ${className ?? ''}`}>
      {!videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <p className="text-sm">{t('loadVideoDescription')}</p>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        playsInline
        preload="metadata"
      />
    </div>
  );
}
