import { create } from 'zustand';
import { Keyframe } from '@/types';

type UndoEntry = {
  keyframes: Keyframe[];
};

type EditorStore = {
  isEditMode: boolean;
  selectedMemberId: string | null;
  undoStack: UndoEntry[];
  interpolationType: 'linear' | 'easeInOut';

  enterEditMode: () => void;
  exitEditMode: () => void;
  setSelectedMemberId: (id: string | null) => void;
  pushUndo: (keyframes: Keyframe[]) => void;
  popUndo: () => Keyframe[] | null;
  setInterpolationType: (type: 'linear' | 'easeInOut') => void;
  clearUndoStack: () => void;
};

const MAX_UNDO_STACK = 50;

export const useEditorStore = create<EditorStore>((set, get) => ({
  isEditMode: false,
  selectedMemberId: null,
  undoStack: [],
  interpolationType: 'linear',

  enterEditMode: () => set({ isEditMode: true, selectedMemberId: null, undoStack: [] }),

  exitEditMode: () => set({ isEditMode: false, selectedMemberId: null, undoStack: [] }),

  setSelectedMemberId: (selectedMemberId) => set({ selectedMemberId }),

  pushUndo: (keyframes) => {
    set((state) => ({
      undoStack: [
        ...state.undoStack.slice(-MAX_UNDO_STACK + 1),
        { keyframes },
      ],
    }));
  },

  popUndo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return null;
    const last = undoStack[undoStack.length - 1];
    set({ undoStack: undoStack.slice(0, -1) });
    return last.keyframes;
  },

  setInterpolationType: (interpolationType) => set({ interpolationType }),

  clearUndoStack: () => set({ undoStack: [] }),
}));
