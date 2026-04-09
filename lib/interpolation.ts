import { Keyframe, MemberPosition } from '@/types';

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function interpolatePositions(
  keyframes: Keyframe[],
  timestamp: number
): MemberPosition[] {
  if (keyframes.length === 0) return [];

  const sorted = [...keyframes].sort((a, b) => a.timestamp - b.timestamp);

  if (timestamp <= sorted[0].timestamp) {
    return sorted[0].positions;
  }
  if (timestamp >= sorted[sorted.length - 1].timestamp) {
    return sorted[sorted.length - 1].positions;
  }

  let beforeIndex = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].timestamp <= timestamp && sorted[i + 1].timestamp >= timestamp) {
      beforeIndex = i;
      break;
    }
  }

  const before = sorted[beforeIndex];
  const after = sorted[beforeIndex + 1];
  const range = after.timestamp - before.timestamp;
  const rawT = range === 0 ? 0 : (timestamp - before.timestamp) / range;
  const t =
    before.interpolation === 'easeInOut' ? easeInOut(rawT) : rawT;

  const memberIdSet = new Set([
    ...before.positions.map((p) => p.memberId),
    ...after.positions.map((p) => p.memberId),
  ]);
  const memberIds = Array.from(memberIdSet);

  const result: MemberPosition[] = [];
  for (const memberId of memberIds) {
    const posB = before.positions.find((p) => p.memberId === memberId);
    const posA = after.positions.find((p) => p.memberId === memberId);

    if (posB && posA) {
      result.push({
        memberId,
        x: lerp(posB.x, posA.x, t),
        y: lerp(posB.y, posA.y, t),
      });
    } else if (posB) {
      result.push({ ...posB });
    } else if (posA) {
      result.push({ ...posA });
    }
  }

  return result;
}

export function getPositionsAtTime(
  keyframes: Keyframe[],
  timestamp: number
): MemberPosition[] {
  return interpolatePositions(keyframes, timestamp);
}
