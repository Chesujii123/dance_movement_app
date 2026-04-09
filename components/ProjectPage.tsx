'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useEditorStore } from '@/stores/editorStore';
import VideoPlayer from '@/components/player/VideoPlayer';
import PlayerControls from '@/components/player/PlayerControls';
import FloorMap from '@/components/floormap/FloorMap';
import EditorToolbar from '@/components/editor/EditorToolbar';
import HamburgerMenu from '@/components/menu/HamburgerMenu';

type ProjectPageProps = {
  projectId: string;
};

export default function ProjectPage({ projectId }: ProjectPageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const doubleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showDoubleTapHint, setShowDoubleTapHint] = useState(false);

  const { setCurrentProject, currentProject } = useProjectStore();
  const { videoUrl, setVideoUrl } = usePlayerStore();
  const { isEditMode, enterEditMode } = useEditorStore();

  useEffect(() => {
    setCurrentProject(projectId);
  }, [projectId, setCurrentProject]);

  useEffect(() => {
    if (!videoUrl) {
      const cached = sessionStorage.getItem(`video_${projectId}`);
      if (cached) setVideoUrl(cached);
    }
  }, [projectId, videoUrl, setVideoUrl]);

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-gray-400 mb-4">プロジェクトが見つかりません</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm"
          >
            トップへ戻る
          </button>
        </div>
      </div>
    );
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    sessionStorage.setItem(`video_${projectId}`, url);
    setVideoUrl(url);
    // inputをリセットして同じファイルも再選択できるようにする
    e.target.value = '';
  };

  // ダブルタップ検出
  const handleVideoAreaTap = () => {
    if (doubleTapTimerRef.current) {
      // 2回目のタップ → ダブルタップ確定
      clearTimeout(doubleTapTimerRef.current);
      doubleTapTimerRef.current = null;
      fileInputRef.current?.click();
    } else {
      // 1回目のタップ → 300ms待つ
      doubleTapTimerRef.current = setTimeout(() => {
        doubleTapTimerRef.current = null;
      }, 300);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center px-3 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white"
          aria-label="戻る"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-white text-sm font-medium truncate px-2">
          {currentProject.title}
        </h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[44px] px-3 text-pink-400 hover:text-pink-300 text-sm"
        >
          {videoUrl ? '動画を変更' : '動画を読み込む'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleVideoSelect}
          className="hidden"
        />
      </div>

      {/* 動画プレイヤー（ダブルタップで動画変更） */}
      <div
        className="flex-shrink-0 relative cursor-pointer select-none"
        style={{ height: '40%' }}
        onClick={handleVideoAreaTap}
        onMouseEnter={() => setShowDoubleTapHint(true)}
        onMouseLeave={() => setShowDoubleTapHint(false)}
      >
        <VideoPlayer className="w-full h-full" />
        {/* ダブルタップヒント（動画あり・ホバー時） */}
        {videoUrl && showDoubleTapHint && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              ダブルタップで動画を変更
            </span>
          </div>
        )}
      </div>

      {/* 床面図 */}
      <div className="flex-1 min-h-0 relative">
        <FloorMap className="absolute inset-0" />
      </div>

      {/* 編集モードツールバー or 再生コントロール */}
      {isEditMode ? (
        <EditorToolbar />
      ) : (
        <div className="flex items-center bg-gray-900 border-t border-gray-800 flex-shrink-0">
          <HamburgerMenu onEdit={enterEditMode} />
          <div className="flex-1">
            <PlayerControls />
          </div>
        </div>
      )}
    </div>
  );
}
