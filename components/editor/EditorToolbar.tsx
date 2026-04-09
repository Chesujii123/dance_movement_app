'use client';

import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useTranslations } from 'next-intl';
import { interpolatePositions } from '@/lib/interpolation';

export default function EditorToolbar() {
  const t = useTranslations('common');
  const tEditor = useTranslations('editor');

  const { selectedMemberId, undoStack, popUndo, exitEditMode } = useEditorStore();
  const { currentProject, addMember, deleteMember, updateProject } = useProjectStore();
  const { currentTime } = usePlayerStore();

  if (!currentProject) return null;

  const handleAdd = () => {
    addMember(currentProject.id);
  };

  const handleDelete = () => {
    if (!selectedMemberId) return;
    deleteMember(currentProject.id, selectedMemberId);
  };

  const handleUndo = () => {
    const prev = popUndo();
    if (prev) {
      updateProject(currentProject.id, { keyframes: prev });
    }
  };

  const handleDone = () => {
    exitEditMode();
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-t border-gray-700">
      <button
        onClick={handleAdd}
        className="min-h-[44px] min-w-[44px] px-3 rounded-lg bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white text-sm font-medium transition-colors"
      >
        {t('add')}
      </button>
      <button
        onClick={handleDelete}
        disabled={!selectedMemberId}
        className="min-h-[44px] min-w-[44px] px-3 rounded-lg bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t('delete')}
      </button>
      <button
        onClick={handleUndo}
        disabled={undoStack.length === 0}
        className="min-h-[44px] min-w-[44px] px-3 rounded-lg bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={t('undo')}
      >
        ↩
      </button>
      <div className="flex-1" />
      <button
        onClick={handleDone}
        className="min-h-[44px] px-4 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-colors"
      >
        {t('done')}
      </button>
    </div>
  );
}
