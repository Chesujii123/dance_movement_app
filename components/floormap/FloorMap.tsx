'use client';

import { useProjectStore } from '@/stores/projectStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useEditorStore } from '@/stores/editorStore';
import FloorMapCanvas from './FloorMapCanvas';

type FloorMapProps = {
  className?: string;
};

export default function FloorMap({ className }: FloorMapProps) {
  const { currentProject, deleteMember } = useProjectStore();
  const { currentTime } = usePlayerStore();
  const { isEditMode, selectedMemberId, setSelectedMemberId } = useEditorStore();

  if (!currentProject) return null;

  const handleDelete = () => {
    if (!selectedMemberId) return;
    deleteMember(currentProject.id, selectedMemberId);
    setSelectedMemberId(null);
  };

  return (
    <div className={`relative bg-[#1a1a2e] ${className ?? ''}`}>
      <FloorMapCanvas
        members={currentProject.members}
        keyframes={currentProject.keyframes}
        currentTime={currentTime}
        gridSize={currentProject.gridSize}
        isEditMode={isEditMode}
        projectId={currentProject.id}
        className="w-full h-full"
      />

      {/* 選択中の点を削除するボタン（編集モード・選択時のみ表示） */}
      {isEditMode && selectedMemberId && (
        <button
          onClick={handleDelete}
          className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-medium rounded-xl shadow-lg transition-colors min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          削除
        </button>
      )}
    </div>
  );
}
