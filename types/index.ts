export type Project = {
  id: string;
  title: string;
  videoFileName: string;
  members: Member[];
  keyframes: Keyframe[];
  gridSize: { width: number; height: number };
  createdAt: string;
  updatedAt: string;
};

export type Member = {
  id: string;
  name?: string;
  color: string;
};

export type Keyframe = {
  id: string;
  timestamp: number;
  positions: MemberPosition[];
  interpolation: 'linear' | 'easeInOut';
};

export type MemberPosition = {
  memberId: string;
  x: number;
  y: number;
};

export const DEFAULT_MEMBER_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

export const DEFAULT_GRID_SIZE = { width: 10, height: 8 };
