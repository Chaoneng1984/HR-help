import React, { useState } from 'react';
import { AppTab, Participant } from './types';
import Navbar from './components/Navbar';
import InputSection from './components/InputSection';
import LotterySection from './components/LotterySection';
import GroupingSection from './components/GroupingSection';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.INPUT);
  const [participants, setParticipants] = useState<Participant[]>([]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="transition-opacity duration-300">
          {currentTab === AppTab.INPUT && (
            <InputSection 
              participants={participants} 
              setParticipants={setParticipants} 
            />
          )}
          
          {currentTab === AppTab.LOTTERY && (
            <LotterySection participants={participants} />
          )}
          
          {currentTab === AppTab.GROUPING && (
            <GroupingSection participants={participants} />
          )}
        </div>
      </main>
      
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} HR Productivity Tools. Built with React, Tailwind & Gemini AI.</p>
      </footer>
    </div>
  );
};

export default App;
