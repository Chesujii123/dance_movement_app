'use client';

import { useEffect, useState } from 'react';
import { loadProjectFromKV } from '@/lib/storage';
import { Project } from '@/types';
import { usePlayerStore } from '@/stores/playerStore';
import VideoPlayer from '@/components/player/VideoPlayer';
import PlayerControls from '@/components/player/PlayerControls';
import FloorMapCanvas from '@/components/floormap/FloorMapCanvas';

type ViewPageProps = {
  projectId: string;
  shareId?: string;
};

export default function ViewPage({ projectId, shareId }: ViewPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTime } = usePlayerStore();

  useEffect(() => {
    if (!shareId) {
      setError('共有IDが指定されていません');
      setLoading(false);
      return;
    }
    loadProjectFromKV(shareId)
      .then((p) => {
        if (!p) {
          setError('プロジェクトが見つかりません');
        } else {
          setProject(p);
        }
      })
      .catch(() => setError('読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-gray-400 mb-2">{error ?? '不明なエラー'}</p>
          <p className="text-gray-500 text-xs">共有URLをご確認ください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      <div className="flex items-center px-4 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <h1 className="flex-1 text-white text-sm font-medium">{project.title}</h1>
        <span className="text-gray-500 text-xs bg-gray-800 px-2 py-1 rounded">閲覧専用</span>
      </div>

      <div className="flex-shrink-0" style={{ height: '40%' }}>
        <VideoPlayer className="w-full h-full" />
      </div>

      <div className="flex-1 min-h-0 relative bg-[#1a1a2e]">
        <FloorMapCanvas
          members={project.members}
          keyframes={project.keyframes}
          currentTime={currentTime}
          gridSize={project.gridSize}
          isEditMode={false}
          projectId={project.id}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <div className="flex-shrink-0">
        <PlayerControls />
      </div>
    </div>
  );
}
