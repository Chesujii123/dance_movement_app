'use client';

import { useProjectStore } from '@/stores/projectStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useEditorStore } from '@/stores/editorStore';
import FloorMapCanvas from './FloorMapCanvas';

type FloorMapProps = {
  className?: string;
};

export default function FloorMap({ className }: FloorMapProps) {
  const { currentProject } = useProjectStore();
  const { currentTime } = usePlayerStore();
  const { isEditMode } = useEditorStore();

  if (!currentProject) return null;

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
    </div>
  );
}
