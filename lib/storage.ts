import { Project } from '@/types';

const STORAGE_KEY = 'formation-viewer-projects';

export function saveProjectsToLocal(projects: Project[]): void {
  try {
    const data = projects.map((p) => ({
      ...p,
      // 動画ファイル本体は保存しない（ファイル名のみ）
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function loadProjectsFromLocal(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Project[];
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return [];
  }
}

export async function saveProjectToKV(project: Project): Promise<string> {
  const response = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    throw new Error('Failed to save project to KV');
  }
  const data = await response.json() as { id: string };
  return data.id;
}

export async function loadProjectFromKV(id: string): Promise<Project | null> {
  const response = await fetch(`/api/share?id=${id}`);
  if (!response.ok) return null;
  return response.json() as Promise<Project>;
}
