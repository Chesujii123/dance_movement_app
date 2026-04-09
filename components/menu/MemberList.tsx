'use client';

import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { Member } from '@/types';

const PRESET_COLORS = [
  '#FF3B30', // 赤
  '#FF9500', // オレンジ
  '#FFCC00', // 黄
  '#34C759', // 緑
  '#00C7BE', // シアン
  '#007AFF', // 青
  '#5856D6', // 紫
  '#FF2D55', // ピンク
  '#FFFFFF', // 白
  '#8E8E93', // グレー
];

type MemberItemProps = {
  member: Member;
  projectId: string;
};

function MemberItem({ member, projectId }: MemberItemProps) {
  const { updateMember, deleteMember } = useProjectStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(member.name ?? '');
  const [color, setColor] = useState(member.color);
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部からメンバーが更新された場合に同期
  useEffect(() => {
    setName(member.name ?? '');
    setColor(member.color);
  }, [member.name, member.color]);

  // 名前入力モードに入ったらフォーカス
  useEffect(() => {
    if (isEditingName) inputRef.current?.focus();
  }, [isEditingName]);

  const saveName = () => {
    updateMember(projectId, member.id, { name: name.trim() || undefined, color });
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') {
      setName(member.name ?? '');
      setIsEditingName(false);
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    updateMember(projectId, member.id, { color: newColor });
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-3 space-y-2">
      {/* 上段：色丸 + 名前 + 削除 */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white/30"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={handleNameKeyDown}
              placeholder="名前を入力"
              className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-pink-500"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="w-full text-left text-sm truncate py-1 px-1 rounded hover:bg-gray-700 transition-colors"
            >
              {name
                ? <span className="text-white">{name}</span>
                : <span className="text-gray-500 italic">名前未設定（タップで編集）</span>
              }
            </button>
          )}
        </div>
        <button
          onClick={() => deleteMember(projectId, member.id)}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors"
          aria-label="削除"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 下段：プリセットカラー＋カスタムカラーピッカー */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            onClick={() => handleColorChange(preset)}
            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 flex-shrink-0"
            style={{
              backgroundColor: preset,
              borderColor: color === preset ? '#fff' : 'rgba(255,255,255,0.2)',
              transform: color === preset ? 'scale(1.15)' : undefined,
            }}
            aria-label={preset}
          />
        ))}
        {/* カスタムカラーピッカー */}
        <label className="relative w-7 h-7 rounded-full border-2 border-dashed border-white/30 hover:border-white/60 transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
          title="カスタムカラー"
        >
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

export default function MemberList() {
  const { currentProject, addMember } = useProjectStore();

  if (!currentProject) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold text-sm">メンバー</h3>
        <button
          onClick={() => addMember(currentProject.id)}
          className="min-h-[36px] px-3 bg-pink-600 hover:bg-pink-500 text-white text-xs rounded-lg transition-colors"
        >
          + 追加
        </button>
      </div>
      {currentProject.members.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">メンバーがいません</p>
      ) : (
        <div className="space-y-0.5">
          {currentProject.members.map((member) => (
            <MemberItem key={member.id} member={member} projectId={currentProject.id} />
          ))}
        </div>
      )}
    </div>
  );
}
