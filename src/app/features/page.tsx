'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BoulderEBikeMap from './components/BoulderEBikeMap';
import FlatironHikeMap from './components/FlatironHikeMap';

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<string>('map');

  const tabContent = {
    vizuals: <ComingSoon title="Data Visualizations" />,
    tools: <ComingSoon title="Tools" />,
    demos: <ComingSoon title="Interactive Demos" />
  };

  return (
    <main className="min-h-screen pt-6 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white text-center">Matt&apos;s Features</h1>
          <p className="mt-2 text-emerald-200/70 text-center max-w-2xl mx-auto">
            Explore various feature demos showcasing different capabilities and interesting projects.
          </p>
        </motion.div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md bg-emerald-900/30 p-1 backdrop-blur-sm border border-emerald-700/20">
            {['Vizuals', 'Tools', 'Demos'].map((tab) => {
              const tabKey = tab.toLowerCase();
              const isActive = activeTab === tabKey;
              
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-emerald-700 text-white shadow-md' 
                      : 'text-emerald-200 hover:bg-emerald-800/40 hover:text-white'}
                  `}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20 max-w-7xl mx-auto"
        >
          {tabContent[activeTab as keyof typeof tabContent]}
        </motion.div>
      </div>
    </main>
  );
}

// Placeholder component for tabs under development
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-500/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-emerald-200/70 max-w-md">
        This feature is currently under development. Check back soon for exciting new content!
      </p>
      <Link 
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-emerald-700/50 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600/50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Return Home
      </Link>
    </div>
  );
}