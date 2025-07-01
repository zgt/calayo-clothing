// src/app/profile/orders/_components/CommissionsList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type CommissionMeasurements = {
  id: string;
  commission_id: string;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  // Additional fields omitted for brevity
};

type Commission = {
  id: string;
  status: string;
  garment_type: string;
  budget: string;
  timeline: string;
  details: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  commission_measurements: CommissionMeasurements | null;
};

interface CommissionsListProps {
  commissions: Commission[];
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'in progress':
    case 'In Progress':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'ready':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'completed':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

export default function CommissionsList({ commissions }: CommissionsListProps) {
  const [filter, setFilter] = useState<string>('all');
  
  // Filter commissions based on selected filter
  const filteredCommissions = filter === 'all' 
    ? commissions 
    : commissions.filter(commission => commission.status.toLowerCase() === filter.toLowerCase());
  
  return (
    <div className="rounded-lg bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs p-6 shadow-2xl border border-emerald-700/10">
      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded-full border ${
            filter === 'all' 
              ? 'bg-emerald-700/50 text-white border-emerald-500/50' 
              : 'bg-transparent text-emerald-300 border-emerald-700/30 hover:bg-emerald-800/30'
          } transition-colors`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 text-sm rounded-full border ${
            filter === 'pending' 
              ? 'bg-amber-700/50 text-white border-amber-500/50' 
              : 'bg-transparent text-emerald-300 border-emerald-700/30 hover:bg-emerald-800/30'
          } transition-colors`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('In Progress')}
          className={`px-3 py-1 text-sm rounded-full border ${
            filter === 'In Progress' 
              ? 'bg-purple-700/50 text-white border-purple-500/50' 
              : 'bg-transparent text-emerald-300 border-emerald-700/30 hover:bg-emerald-800/30'
          } transition-colors`}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 text-sm rounded-full border ${
            filter === 'completed' 
              ? 'bg-green-700/50 text-white border-green-500/50' 
              : 'bg-transparent text-emerald-300 border-emerald-700/30 hover:bg-emerald-800/30'
          } transition-colors`}
        >
          Completed
        </button>
      </div>
      
      {/* Commissions List */}
      {filteredCommissions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-emerald-600/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-emerald-100">No commissions found</h3>
          <p className="mt-1 text-emerald-200/70">
            {filter === 'all' 
              ? "You haven't placed any commission requests yet." 
              : `You don't have any ${filter} commissions.`}
          </p>
          {filter === 'all' && (
            <div className="mt-6">
              <Link
                href="/commissions"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/40 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Your First Commission
              </Link>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredCommissions.map((commission, index) => (
            <motion.div
              key={commission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link 
                href={`/profile/orders/${commission.id}`}
                className="block rounded-lg border border-emerald-700/30 bg-emerald-900/30 hover:bg-emerald-800/30 transition-colors p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-white capitalize">
                        {commission.garment_type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(commission.status)}`}>
                        {commission.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-emerald-200/70">
                      <span>Budget: {commission.budget}</span>
                      <span className="mx-2">•</span>
                      <span>Timeline: {commission.timeline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-emerald-200/70">
                      {formatDate(commission.created_at)}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}