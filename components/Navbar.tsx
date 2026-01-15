import React from 'react';
import { AppTab } from '../types';
import { Users, Trophy, FileInput } from 'lucide-react';

interface NavbarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const tabs = [
    { id: AppTab.INPUT, label: '名單輸入', icon: FileInput },
    { id: AppTab.LOTTERY, label: '幸運抽獎', icon: Trophy },
    { id: AppTab.GROUPING, label: '自動分組', icon: Users },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 h-16 items-center justify-center md:justify-start">
            <div className="font-black text-2xl text-brand-700 mr-8 hidden md:block tracking-tight">
                HR ToolKit
            </div>
            {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 
                        ${isActive 
                            ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                        {tab.label}
                    </button>
                )
            })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
