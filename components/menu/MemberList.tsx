'use client';

import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useTranslations } from 'next-intl';
import { Member } from '@/types';

type MemberItemProps = {
  member: Member;
  projectId: string;
};

function MemberItem({ member, projectId }: MemberItemProps) {
  const t = useTranslations('member');
  const { updateMember, deleteMember } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(member.name ?? '');
  const [color, setColor] = useState(member.color);

  const handleSave = () => {
    updateMember(projectId, member.id, { name: name || undefined, color });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 bg-gray-800 rounded-lg space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-pink-500"
        />
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-xs">{t('color')}</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 min-h-[36px] bg-pink-600 hover:bg-pink-500 text-white text-xs rounded transition-colors"
          >
            保存
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 min-h-[36px] bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white/20"
        style={{ backgroundColor: member.color }}
      />
      <span className="flex-1 text-sm text-white truncate">
        {member.name ?? <span className="text-gray-400">名前未設定</span>}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="min-h-[36px] min-w-[36px] text-gray-400 hover:text-white text-xs rounded transition-colors px-2"
      >
        編集
      </button>
      <button
        onClick={() => deleteMember(projectId, member.id)}
        className="min-h-[36px] min-w-[36px] text-gray-400 hover:text-red-400 text-xs rounded transition-colors px-2"
      >
        削除
      </button>
    </div>
  );
}

export default function MemberList() {
  const t = useTranslations('member');
  const { currentProject, addMember } = useProjectStore();

  if (!currentProject) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">メンバー</h3>
        <button
          onClick={() => addMember(currentProject.id)}
          className="min-h-[36px] px-3 bg-pink-600 hover:bg-pink-500 text-white text-xs rounded-lg transition-colors"
        >
          + 追加
        </button>
      </div>
      {currentProject.members.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">{t('noMembers')}</p>
      ) : (
        <div className="space-y-1">
          {currentProject.members.map((member) => (
            <MemberItem key={member.id} member={member} projectId={currentProject.id} />
          ))}
        </div>
      )}
    </div>
  );
}
