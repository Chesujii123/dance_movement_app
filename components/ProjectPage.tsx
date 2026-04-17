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
  const [showDoubleTapHint, setShowDoubleTapHint] = useState(false);

  const { setCurrentProject, currentProject } = useProjectStore();
  const { videoUrl, setVideoUrl, togglePlay } = usePlayerStore();
  const { isEditMode, enterEditMode } = useEditorStore();

  useEffect(() => {
    setCurrentProject(projectId);
  }, [projectId, setCurrentProject]);

  useEffect(() => {
    // プロジェクトが切り替わったら動画をリセットし、そのプロジェクト用のキャッシュを読み込む
    setVideoUrl(null);
    const cached = sessionStorage.getItem(`video_${projectId}`);
    if (cached) setVideoUrl(cached);
  }, [projectId, setVideoUrl]);

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
    e.target.value = '';
  };

  const handleVideoAreaTap = () => {
    if (videoUrl) togglePlay();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">

      {/* ヘッダー：左に戻るボタン、中央にタイトル、右にハンバーガーメニュー */}
      <div className="flex items-center px-2 py-1 bg-gray-900 border-b border-gray-800 flex-shrink-0">
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

        {/* ハンバーガーメニュー（ヘッダー右上） */}
        <HamburgerMenu
          onEdit={enterEditMode}
          onVideoChange={() => fileInputRef.current?.click()}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleVideoSelect}
          className="hidden"
        />
      </div>

      {/* 動画プレイヤー */}
      <div
        className="flex-shrink-0 relative select-none"
        style={{ height: '40%' }}
        onClick={videoUrl ? handleVideoAreaTap : undefined}
        onMouseEnter={() => setShowDoubleTapHint(true)}
        onMouseLeave={() => setShowDoubleTapHint(false)}
      >
        <VideoPlayer className="w-full h-full" />

        {/* 動画未選択時：読み込みボタンを中央表示 */}
        {!videoUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-2xl transition-colors"
            >
              <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              <span className="text-white text-sm font-medium">動画を読み込む</span>
              <span className="text-white/40 text-xs">MP4 / MOV / WebM</span>
            </button>
          </div>
        )}

        {/* 動画選択済み・ホバー時ヒント */}
        {videoUrl && showDoubleTapHint && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              タップで再生 / 一時停止
            </span>
          </div>
        )}
      </div>

      {/* 床面図 */}
      <div className="flex-1 min-h-0 relative">
        <FloorMap className="absolute inset-0" />
      </div>

      {/* 再生コントロール or 編集ツールバー */}
      {isEditMode ? (
        <EditorToolbar />
      ) : (
        <PlayerControls className="flex-shrink-0" />
      )}
    </div>
  );
}
