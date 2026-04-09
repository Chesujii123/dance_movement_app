'use client';

import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { Member } from '@/types';

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
    <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors group">
      {/* カラーピッカー（色丸をタップ） */}
      <label className="relative flex-shrink-0 cursor-pointer">
        <div
          className="w-9 h-9 rounded-full border-2 border-white/20 hover:border-white/50 transition-colors"
          style={{ backgroundColor: color }}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          aria-label="カラーを変更"
        />
      </label>

      {/* 名前（タップで編集） */}
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
            className="w-full text-left text-sm truncate py-1 px-2 rounded hover:bg-gray-700 transition-colors"
          >
            {name
              ? <span className="text-white">{name}</span>
              : <span className="text-gray-500 italic">名前未設定（タップで編集）</span>
            }
          </button>
        )}
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => deleteMember(projectId, member.id)}
        className="min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="削除"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
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
