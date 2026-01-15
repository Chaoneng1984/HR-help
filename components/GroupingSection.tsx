import React, { useState, useEffect } from 'react';
import { Participant, Group } from '../types';
import { generateCreativeTeamNames } from '../services/geminiService';
import { Users, Sparkles, RefreshCcw, Copy, Check } from 'lucide-react';

interface GroupingSectionProps {
  participants: Participant[];
}

// Fisher-Yates Shuffle
// Moved outside component to avoid TSX generic arrow function parsing issues
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const GroupingSection: React.FC<GroupingSectionProps> = ({ participants }) => {
  const [groupSize, setGroupSize] = useState<number>(3);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [themeInput, setThemeInput] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);

  const handleGroup = () => {
    if (participants.length === 0) return;

    const shuffled = shuffleArray(participants);
    const newGroups: Group[] = [];
    const numberOfGroups = Math.ceil(shuffled.length / groupSize);

    for (let i = 0; i < numberOfGroups; i++) {
        // Distribute fairly logic could go here, but simple chunking is requested
        // Actually, to avoid a group of 1 at the end, usually we distribute round-robin or chunk
        // Let's stick to simple chunk for simplicity, or we can balance.
        // Let's do simple slicing as requested "Group by X people".
        const start = i * groupSize;
        const end = start + groupSize;
        const members = shuffled.slice(start, end);
        
        newGroups.push({
            id: crypto.randomUUID(),
            name: `第 ${i + 1} 組`,
            members
        });
    }
    setGroups(newGroups);
  };

  // Initial group when participants change
  useEffect(() => {
    if (groups.length === 0 && participants.length > 0) {
        // Don't auto group immediately to let user choose size, but maybe show empty state
    }
  }, [participants]);

  const handleAiNaming = async () => {
    if (groups.length === 0) return;
    setIsGeneratingNames(true);
    
    // Default theme if empty
    const theme = themeInput.trim() || "Animals representing teamwork";
    
    const newNames = await generateCreativeTeamNames(groups.length, theme);
    
    setGroups(prev => prev.map((g, idx) => ({
        ...g,
        name: newNames[idx] || g.name
    })));
    
    setIsGeneratingNames(false);
    setShowThemeModal(false);
  };

  const copyGroupToClipboard = (group: Group) => {
    const text = `${group.name}\n${group.members.map(m => m.name).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedGroup(group.id);
    setTimeout(() => setCopiedGroup(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-700">
                <Users className="w-5 h-5" />
                <span className="font-bold">每組人數:</span>
            </div>
            <input 
                type="number" 
                min="2" 
                max={participants.length || 100} 
                value={groupSize} 
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-20 p-2 border border-slate-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-brand-500"
            />
        </div>

        <button 
            onClick={handleGroup}
            disabled={participants.length === 0}
            className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-md disabled:opacity-50"
        >
            <RefreshCcw className="w-4 h-4" />
            自動分組
        </button>

        <div className="flex-1"></div>

        {groups.length > 0 && (
            <button 
                onClick={() => setShowThemeModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
            >
                <Sparkles className="w-4 h-4" />
                AI 幫取隊名
            </button>
        )}
      </div>

      {/* AI Theme Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI 創意命名
                </h3>
                <p className="text-slate-600 mb-4 text-sm">請輸入一個主題，AI 將為您的 {groups.length} 個小組生成獨特的隊名。</p>
                <input 
                    type="text" 
                    placeholder="例如：漫威英雄、台灣小吃、可愛動物..."
                    value={themeInput}
                    onChange={(e) => setThemeInput(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg mb-6 focus:ring-2 focus:ring-purple-500 outline-none"
                    autoFocus
                />
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setShowThemeModal(false)}
                        className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleAiNaming}
                        disabled={isGeneratingNames}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                        {isGeneratingNames ? '生成中...' : '開始生成'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Visualization Grid */}
      {groups.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">請設定人數並點擊「自動分組」</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((group) => (
                <div key={group.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 truncate pr-2" title={group.name}>{group.name}</h3>
                        <button 
                            onClick={() => copyGroupToClipboard(group)}
                            className="text-slate-400 hover:text-brand-600 transition-colors"
                            title="複製名單"
                        >
                            {copiedGroup === group.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="p-4 flex-1">
                        <ul className="space-y-2">
                            {group.members.map(member => (
                                <li key={member.id} className="flex items-center gap-2 text-slate-700">
                                    <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                                    {member.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-2 text-center text-xs text-slate-400 border-t border-slate-100">
                        {group.members.length} 人
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default GroupingSection;