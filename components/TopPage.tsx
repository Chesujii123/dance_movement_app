'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';

export default function TopPage() {
  const router = useRouter();
  const { projects, createProject, deleteProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    const project = createProject(
      title.trim(),
      selectedFile?.name ?? ''
    );
    // 動画URLをsessionStorageに保存（localStorage容量節約のため）
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      sessionStorage.setItem(`video_${project.id}`, url);
    }
    router.push(`/project/${project.id}`);
  };

  const handleOpen = (id: string) => {
    router.push(`/project/${id}`);
  };

  const handleDeleteConfirm = (id: string) => {
    deleteProject(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* ヘッダー */}
      <header className="px-4 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">
          <span className="text-pink-500">Formation</span>Viewer
        </h1>
        <p className="text-gray-400 text-xs mt-0.5">
          ダンスフォーメーション可視化ツール
        </p>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* 新規作成ボタン */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full min-h-[56px] bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white rounded-xl text-base font-semibold transition-colors mb-6"
          >
            + 新規プロジェクト
          </button>
        ) : (
          <div className="bg-gray-900 rounded-xl p-4 mb-6 space-y-3">
            <h2 className="text-white font-semibold text-sm">新規プロジェクト作成</h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="プロジェクト名を入力"
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-pink-500"
              autoFocus
            />
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[44px] bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors border border-gray-700 border-dashed"
              >
                {selectedFile ? (
                  <span className="text-pink-400">{selectedFile.name}</span>
                ) : (
                  <span className="text-gray-400">動画ファイルを選択（任意）</span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-gray-500 text-xs mt-1 text-center">
                MP4, MOV, WebM 対応
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="flex-1 min-h-[44px] bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
              >
                作成
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setTitle('');
                  setSelectedFile(null);
                }}
                className="flex-1 min-h-[44px] bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* プロジェクト一覧 */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">💃</p>
            <p className="text-gray-400 text-sm">プロジェクトがありません</p>
            <p className="text-gray-500 text-xs mt-1">新規作成して始めましょう</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
              プロジェクト
            </h2>
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-900 rounded-xl overflow-hidden"
              >
                {deleteConfirmId === project.id ? (
                  <div className="p-4 flex items-center gap-3">
                    <p className="flex-1 text-sm text-white">削除してもよろしいですか？</p>
                    <button
                      onClick={() => handleDeleteConfirm(project.id)}
                      className="min-h-[36px] px-3 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg transition-colors"
                    >
                      削除
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="min-h-[36px] px-3 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <button
                      onClick={() => handleOpen(project.id)}
                      className="flex-1 p-4 text-left"
                    >
                      <p className="text-white text-sm font-medium">{project.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {project.videoFileName || '動画未設定'} ·{' '}
                        {project.members.length}人 ·{' '}
                        {project.keyframes.length}フレーム
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(project.id)}
                      className="min-h-[56px] min-w-[44px] flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors px-3"
                      aria-label="削除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
