import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Participant } from '../types';
import { Trophy, RefreshCw, Trash, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface LotterySectionProps {
  participants: Participant[];
}

interface WinnerRecord {
  id: string;
  name: string;
  timestamp: Date;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

const LotterySection: React.FC<LotterySectionProps> = ({ participants }) => {
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [displayValue, setDisplayValue] = useState("準備抽獎");
  
  // Animation ref
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  const availableParticipants = allowRepeat 
    ? participants 
    : participants.filter(p => !winners.some(w => w.id === p.id));

  const startLottery = useCallback(() => {
    if (availableParticipants.length === 0) {
      alert("沒有可抽獎的參加者！");
      return;
    }

    setIsSpinning(true);
    setCurrentWinner(null);
    let speed = 50;
    let duration = 3000; // 3 seconds spin
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (now - lastUpdateRef.current > speed) {
        // Pick a random name to display
        const randomIndex = Math.floor(Math.random() * availableParticipants.length);
        setDisplayValue(availableParticipants[randomIndex].name);
        lastUpdateRef.current = now;
      }

      if (elapsed < duration) {
        // Slow down slightly at the end
        if (elapsed > duration * 0.7) {
            speed = 100;
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Finalize
        const finalWinnerIndex = Math.floor(Math.random() * availableParticipants.length);
        const winner = availableParticipants[finalWinnerIndex];
        setDisplayValue(winner.name);
        setCurrentWinner(winner);
        setWinners(prev => [{...winner, timestamp: new Date()}, ...prev]);
        setIsSpinning(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

  }, [availableParticipants]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const resetHistory = () => {
    if (confirm("確定要清除中獎紀錄嗎？")) {
      setWinners([]);
      setCurrentWinner(null);
      setDisplayValue("準備抽獎");
    }
  };

  // Prepare data for chart (Winners count usually 1 per person unless repeat allowed)
  const chartData = winners.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.name);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.name, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);


  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Control & Display */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Main Display Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-brand-100 overflow-hidden relative min-h-[300px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-slate-50">
          <div className={`text-6xl md:text-7xl font-bold text-center transition-all duration-100 ${isSpinning ? 'text-slate-400 blur-[1px]' : 'text-brand-600 scale-110'}`}>
            {displayValue}
          </div>
          
          {currentWinner && !isSpinning && (
            <div className="mt-4 animate-bounce-short text-amber-500 font-bold text-xl flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              恭喜中獎！
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="flex items-center space-x-2 text-slate-700 bg-slate-100 px-4 py-2 rounded-lg">
                <Settings className="w-4 h-4" />
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowRepeat}
                    onChange={(e) => setAllowRepeat(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                  <span>允許重複中獎</span>
                </label>
             </div>
             <div className="text-sm text-slate-500 px-2">
                剩餘人數: {availableParticipants.length}
             </div>
          </div>

          <button
            onClick={startLottery}
            disabled={isSpinning || availableParticipants.length === 0}
            className="flex-1 max-w-[200px] bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-brand-200 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {isSpinning ? '抽獎中...' : '開始抽獎'}
          </button>
        </div>
      </div>

      {/* Right Column: History & Stats */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              中獎名單
            </h3>
            {winners.length > 0 && (
              <button onClick={resetHistory} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 custom-scrollbar">
            {winners.length === 0 && (
               <p className="text-slate-400 text-sm text-center py-8">尚無中獎紀錄</p>
            )}
            {winners.map((w, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-amber-50 border border-amber-100 rounded-lg animate-fade-in">
                <span className="font-bold text-slate-700">#{winners.length - idx} {w.name}</span>
                <span className="text-xs text-slate-400">{w.timestamp.toLocaleTimeString()}</span>
              </div>
            ))}
          </div>

          {/* Mini Chart for fun */}
          {winners.length > 0 && allowRepeat && (
             <div className="h-32 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotterySection;
