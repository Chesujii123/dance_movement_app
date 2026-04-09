import { create } from 'zustand';

type PlayerStore = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  videoUrl: string | null;
  videoElement: HTMLVideoElement | null;

  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVideoUrl: (url: string | null) => void;
  setVideoElement: (el: HTMLVideoElement | null) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  videoUrl: null,
  videoElement: null,

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVideoUrl: (videoUrl) => set({ videoUrl }),
  setVideoElement: (videoElement) => set({ videoElement }),

  togglePlay: () => {
    const { isPlaying, videoElement } = get();
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
    }
    set({ isPlaying: !isPlaying });
  },

  seekTo: (time) => {
    const { videoElement } = get();
    if (videoElement) {
      videoElement.currentTime = time;
    }
    set({ currentTime: time });
  },
}));
