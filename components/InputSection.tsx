import React, { useState, useRef } from 'react';
import { Participant } from '../types';
import { extractNamesFromText } from '../services/geminiService';
import { Upload, FileText, Trash2, Sparkles, UserPlus, List } from 'lucide-react';

interface InputSectionProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

const InputSection: React.FC<InputSectionProps> = ({ participants, setParticipants }) => {
  const [inputText, setInputText] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFromText = () => {
    if (!inputText.trim()) return;
    
    // Basic split by newline or comma
    const rawNames = inputText.split(/[,\n]+/).map(s => s.trim()).filter(s => s.length > 0);
    const newParticipants: Participant[] = rawNames.map(name => ({
      id: crypto.randomUUID(),
      name
    }));

    setParticipants(prev => [...prev, ...newParticipants]);
    setInputText('');
  };

  const handleAiParse = async () => {
    if (!inputText.trim()) return;
    setIsLoadingAi(true);
    try {
      const names = await extractNamesFromText(inputText);
      const newParticipants: Participant[] = names.map(name => ({
        id: crypto.randomUUID(),
        name
      }));
      setParticipants(prev => [...prev, ...newParticipants]);
      setInputText('');
    } catch (e) {
      alert('AI 解析失敗，請檢查 API Key 或網路連線');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        // Simple CSV parser: assumes one column or first column is name
        const lines = text.split(/\r?\n/);
        const newParticipants: Participant[] = [];
        
        lines.forEach(line => {
          const cleanLine = line.trim();
          if (cleanLine) {
            const columns = cleanLine.split(',');
            const name = columns[0].trim(); // Take first column
            if (name) {
              newParticipants.push({
                id: crypto.randomUUID(),
                name
              });
            }
          }
        });
        setParticipants(prev => [...prev, ...newParticipants]);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    if (confirm('確定要清空所有名單嗎？')) {
      setParticipants([]);
    }
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Input Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" />
          名單來源
        </h2>
        
        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="請在此貼上姓名 (可用換行或逗號分隔)，或貼上雜亂的 Email 內容讓 AI 解析..."
            className="w-full h-32 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none text-slate-700"
          />
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddFromText}
              disabled={!inputText.trim() || isLoadingAi}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              直接加入
            </button>
            
            <button
              onClick={handleAiParse}
              disabled={!inputText.trim() || isLoadingAi}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50"
            >
              {isLoadingAi ? (
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              AI 智能解析
            </button>

            <div className="flex-1"></div>

            <input
              type="file"
              accept=".csv,.txt"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              上傳 CSV
            </button>
          </div>
        </div>
      </div>

      {/* List Display */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <List className="w-5 h-5 text-brand-600" />
            目前名單 ({participants.length} 人)
          </h2>
          {participants.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 px-3 py-1 rounded hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          )}
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <p>目前沒有名單，請由上方新增</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {participants.map((p) => (
              <div key={p.id} className="group relative bg-slate-50 p-3 rounded-lg border border-slate-200 text-center hover:border-brand-300 transition-colors">
                <span className="font-medium text-slate-700 truncate block">{p.name}</span>
                <button
                  onClick={() => removeParticipant(p.id)}
                  className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;
