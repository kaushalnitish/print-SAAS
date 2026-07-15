import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 md:py-12 px-0 md:px-4">
      {/* Immersive Mobile Viewport Container */}
      <div className="w-full max-w-md bg-white md:rounded-[36px] md:shadow-[0_20px_50px_rgba(0,0,0,0.06)] md:border border-slate-100 min-h-screen md:min-h-[840px] flex flex-col overflow-hidden relative">
        {/* Dynamic Navigation Header */}
        <Header />
        
        {/* Inner page container */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
