import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Member, Keyframe, DEFAULT_MEMBER_COLORS, DEFAULT_GRID_SIZE } from '@/types';
import { nanoid } from 'nanoid';

type ProjectStore = {
  projects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;

  createProject: (title: string, videoFileName: string) => Project;
  setCurrentProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addMember: (projectId: string) => void;
  addMemberWithPosition: (projectId: string, timestamp: number) => void;
  updateMember: (projectId: string, memberId: string, updates: Partial<Member>) => void;
  deleteMember: (projectId: string, memberId: string) => void;

  addKeyframe: (projectId: string, keyframe: Omit<Keyframe, 'id'>) => void;
  updateKeyframe: (projectId: string, keyframeId: string, updates: Partial<Keyframe>) => void;
  deleteKeyframe: (projectId: string, keyframeId: string) => void;
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      currentProject: null,

      createProject: (title, videoFileName) => {
        const project: Project = {
          id: nanoid(),
          title,
          videoFileName,
          members: [],
          keyframes: [],
          gridSize: DEFAULT_GRID_SIZE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: [...state.projects, project],
          currentProjectId: project.id,
          currentProject: project,
        }));
        return project;
      },

      setCurrentProject: (id) => {
        const project = get().projects.find((p) => p.id === id) ?? null;
        set({ currentProjectId: id, currentProject: project });
      },

      updateProject: (id, updates) => {
        set((state) => {
          const projects = state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          );
          const currentProject =
            state.currentProjectId === id
              ? (projects.find((p) => p.id === id) ?? null)
              : state.currentProject;
          return { projects, currentProject };
        });
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
          currentProject: state.currentProjectId === id ? null : state.currentProject,
        }));
      },

      addMember: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        const colorIndex = project.members.length % DEFAULT_MEMBER_COLORS.length;
        const member: Member = {
          id: nanoid(),
          color: DEFAULT_MEMBER_COLORS[colorIndex],
        };
        get().updateProject(projectId, {
          members: [...project.members, member],
        });
      },

      addMemberWithPosition: (projectId, timestamp) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        const colorIndex = project.members.length % DEFAULT_MEMBER_COLORS.length;
        const member: Member = {
          id: nanoid(),
          color: DEFAULT_MEMBER_COLORS[colorIndex],
        };
        const SNAP = 0.05;
        const existingKf = project.keyframes.find(
          (kf) => Math.abs(kf.timestamp - timestamp) <= SNAP
        );
        let keyframes: Keyframe[];
        if (existingKf) {
          keyframes = project.keyframes.map((kf) =>
            kf.id === existingKf.id
              ? { ...kf, positions: [...kf.positions, { memberId: member.id, x: 0.5, y: 0.5 }] }
              : kf
          );
        } else {
          const newKf: Keyframe = {
            id: nanoid(),
            timestamp,
            positions: [{ memberId: member.id, x: 0.5, y: 0.5 }],
            interpolation: 'linear',
          };
          keyframes = [...project.keyframes, newKf].sort((a, b) => a.timestamp - b.timestamp);
        }
        get().updateProject(projectId, {
          members: [...project.members, member],
          keyframes,
        });
      },

      updateMember: (projectId, memberId, updates) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        get().updateProject(projectId, {
          members: project.members.map((m) =>
            m.id === memberId ? { ...m, ...updates } : m
          ),
        });
      },

      deleteMember: (projectId, memberId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        get().updateProject(projectId, {
          members: project.members.filter((m) => m.id !== memberId),
          keyframes: project.keyframes.map((kf) => ({
            ...kf,
            positions: kf.positions.filter((pos) => pos.memberId !== memberId),
          })),
        });
      },

      addKeyframe: (projectId, keyframe) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        const newKeyframe: Keyframe = { ...keyframe, id: nanoid() };
        const keyframes = [...project.keyframes, newKeyframe].sort(
          (a, b) => a.timestamp - b.timestamp
        );
        get().updateProject(projectId, { keyframes });
      },

      updateKeyframe: (projectId, keyframeId, updates) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        get().updateProject(projectId, {
          keyframes: project.keyframes.map((kf) =>
            kf.id === keyframeId ? { ...kf, ...updates } : kf
          ),
        });
      },

      deleteKeyframe: (projectId, keyframeId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        get().updateProject(projectId, {
          keyframes: project.keyframes.filter((kf) => kf.id !== keyframeId),
        });
      },
    }),
    {
      name: 'formation-viewer-projects',
      partialize: (state) => ({ projects: state.projects }),
    }
  )
);
