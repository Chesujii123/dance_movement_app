'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Member, Keyframe, MemberPosition } from '@/types';
import { interpolatePositions } from '@/lib/interpolation';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import { nanoid } from 'nanoid';

type FloorMapCanvasProps = {
  members: Member[];
  keyframes: Keyframe[];
  currentTime: number;
  gridSize: { width: number; height: number };
  isEditMode: boolean;
  projectId: string;
  className?: string;
};

const DOT_RADIUS = 16;

export default function FloorMapCanvas({
  members,
  keyframes,
  currentTime,
  gridSize,
  isEditMode,
  projectId,
  className,
}: FloorMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const draggingMemberIdRef = useRef<string | null>(null);

  const { selectedMemberId, setSelectedMemberId, pushUndo } = useEditorStore();
  const { updateKeyframe, addKeyframe, currentProject } = useProjectStore();

  const getCanvasPos = useCallback(
    (e: PointerEvent, canvas: HTMLCanvasElement): { x: number; y: number } => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    },
    []
  );

  const draw = useCallback(
    (positions: MemberPosition[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // 背景
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, H);

      // グリッド
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= gridSize.width; x++) {
        const px = (x / gridSize.width) * W;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, H);
        ctx.stroke();
      }
      for (let y = 0; y <= gridSize.height; y++) {
        const py = (y / gridSize.height) * H;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(W, py);
        ctx.stroke();
      }

      // ステージ方向（上）ラベル
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('STAGE', W / 2, 14);

      // メンバーの点
      for (const pos of positions) {
        const member = members.find((m) => m.id === pos.memberId);
        if (!member) continue;

        const x = pos.x * W;
        const y = pos.y * H;
        const isSelected = isEditMode && selectedMemberId === pos.memberId;

        // 選択時の外側リング
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS + 4, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // 点本体
        ctx.beginPath();
        ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = member.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 名前ラベル
        if (member.name) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(member.name.slice(0, 4), x, y + 4);
        }
      }
    },
    [members, gridSize, isEditMode, selectedMemberId]
  );

  // 再生モード：requestAnimationFrameでリアルタイム描画
  useEffect(() => {
    if (isEditMode) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const video = document.querySelector<HTMLVideoElement>('video');
      const time = video ? video.currentTime : currentTime;
      const positions = interpolatePositions(keyframes, time);
      draw(positions);
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isEditMode, keyframes, currentTime, draw]);

  // 編集モード：currentTimeで描画
  useEffect(() => {
    if (!isEditMode) return;
    const positions = interpolatePositions(keyframes, currentTime);
    draw(positions);
  }, [isEditMode, keyframes, currentTime, draw]);

  // ポインターイベント（編集モード）
  useEffect(() => {
    if (!isEditMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      const { x, y } = getCanvasPos(e, canvas);
      const W = canvas.width;
      const H = canvas.height;
      const positions = interpolatePositions(keyframes, currentTime);

      const hitRadius = (DOT_RADIUS + 4) / W;
      const hit = positions.find((pos) => {
        const dx = pos.x - x;
        const dy = (pos.y - y) * (W / H);
        return Math.sqrt(dx * dx + dy * dy) < hitRadius;
      });

      if (hit) {
        setSelectedMemberId(hit.memberId);
        isDraggingRef.current = true;
        draggingMemberIdRef.current = hit.memberId;
        dragStartRef.current = { x, y };
        canvas.setPointerCapture(e.pointerId);
      } else {
        setSelectedMemberId(null);
        draggingMemberIdRef.current = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const draggingMemberId = draggingMemberIdRef.current;
      if (!isDraggingRef.current || !draggingMemberId) return;
      e.preventDefault();
      const { x, y } = getCanvasPos(e, canvas);
      const clampedX = Math.max(0, Math.min(1, x));
      const clampedY = Math.max(0, Math.min(1, y));

      // 現在のキーフレームを更新またはこのタイムスタンプに新規作成
      const existingKf = keyframes.find(
        (kf) => Math.abs(kf.timestamp - currentTime) < 0.05
      );

      if (existingKf) {
        const updatedPositions = existingKf.positions.map((p) =>
          p.memberId === draggingMemberId ? { ...p, x: clampedX, y: clampedY } : p
        );
        if (!updatedPositions.find((p) => p.memberId === draggingMemberId)) {
          updatedPositions.push({ memberId: draggingMemberId, x: clampedX, y: clampedY });
        }
        updateKeyframe(projectId, existingKf.id, { positions: updatedPositions });
      } else {
        const positions = interpolatePositions(keyframes, currentTime).map((p) =>
          p.memberId === draggingMemberId ? { ...p, x: clampedX, y: clampedY } : p
        );
        addKeyframe(projectId, {
          timestamp: currentTime,
          positions,
          interpolation: 'linear',
        });
      }

      // 再描画
      const newPositions = interpolatePositions(
        currentProject?.keyframes ?? keyframes,
        currentTime
      );
      draw(newPositions);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        pushUndo(keyframes);
      }
      isDraggingRef.current = false;
      draggingMemberIdRef.current = null;
      dragStartRef.current = null;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    isEditMode,
    keyframes,
    currentTime,
    projectId,
    getCanvasPos,
    draw,
    setSelectedMemberId,
    pushUndo,
    updateKeyframe,
    addKeyframe,
    currentProject,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      className={`w-full h-full touch-none ${className ?? ''}`}
      style={{ touchAction: 'none' }}
    />
  );
}
