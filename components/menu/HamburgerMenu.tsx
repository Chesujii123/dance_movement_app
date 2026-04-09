'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/stores/projectStore';
import { useEditorStore } from '@/stores/editorStore';
import { usePlayerStore } from '@/stores/playerStore';
import { saveProjectToKV } from '@/lib/storage';
import { exportVideo } from '@/lib/exportVideo';
import MemberList from './MemberList';

type HamburgerMenuProps = {
  onEdit: () => void;
};

export default function HamburgerMenu({ onEdit }: HamburgerMenuProps) {
  const t = useTranslations('common');
  const tShare = useTranslations('share');
  const tExport = useTranslations('export');

  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const { currentProject } = useProjectStore();
  const { isEditMode } = useEditorStore();
  const { isPlaying, videoElement } = usePlayerStore();

  const handleShare = async () => {
    if (!currentProject) return;
    try {
      const id = await saveProjectToKV(currentProject);
      const url = `${window.location.origin}/project/${currentProject.id}/view?share=${id}`;
      setShareUrl(url);
    } catch {
      alert('共有に失敗しました');
    }
  };

  const handleCopyUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExport = async () => {
    if (!currentProject || !videoElement) return;
    setIsExporting(true);
    try {
      await exportVideo({
        videoElement,
        members: currentProject.members,
        keyframes: currentProject.keyframes,
        gridSize: currentProject.gridSize,
        onProgress: (p) => setExportProgress(Math.round(p * 100)),
      });
    } catch (e) {
      console.error(e);
      alert(tExport('exportError'));
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleEdit = () => {
    setIsOpen(false);
    onEdit();
  };

  return (
    <>
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white"
        aria-label="メニュー"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* メニューオーバーレイ */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* 背景クリックで閉じる */}
          <div className="flex-1" onClick={() => setIsOpen(false)} />
          {/* メニューパネル */}
          <div className="w-72 bg-gray-900 h-full overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-white font-semibold">
                {currentProject?.title ?? 'FormationViewer'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white"
                aria-label={t('close')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 flex-1 space-y-4">
              {/* メンバーリスト */}
              <MemberList />

              <hr className="border-gray-700" />

              {/* アクションボタン */}
              <div className="space-y-2">
                {!isPlaying && (
                  <button
                    onClick={handleEdit}
                    className="w-full min-h-[44px] bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('edit')}
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="w-full min-h-[44px] bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white rounded-lg text-sm transition-colors"
                >
                  {t('share')}
                </button>

                {shareUrl && (
                  <div className="p-3 bg-gray-800 rounded-lg space-y-2">
                    <p className="text-gray-400 text-xs">{tShare('shareUrl')}</p>
                    <p className="text-white text-xs break-all">{shareUrl}</p>
                    <button
                      onClick={handleCopyUrl}
                      className="w-full min-h-[36px] bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                    >
                      {isCopied ? tShare('copied') : tShare('copyUrl')}
                    </button>
                  </div>
                )}

                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full min-h-[44px] bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {isExporting
                    ? `${tExport('exporting')} ${exportProgress}%`
                    : t('export')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
