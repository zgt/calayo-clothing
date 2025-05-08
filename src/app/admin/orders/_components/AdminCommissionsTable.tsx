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
  // Additional measurements fields omitted for brevity
};

type Profile = {
  full_name: string | null;
  email: string | null;
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
  profiles: Profile;
};

interface AdminCommissionsTableProps {
  commissions: Commission[];
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'approved':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'in progress':
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

export default function AdminCommissionsTable({ commissions }: AdminCommissionsTableProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter commissions based on selected filter and search term
  const filteredCommissions = commissions
    .filter(commission => 
      filter === 'all' || 
      commission.status.toLowerCase() === filter.toLowerCase()
    )
    .filter(commission => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        ((commission.profiles?.full_name?.toLowerCase().includes(searchLower)) ??
        ((commission.profiles?.email?.toLowerCase().includes(searchLower))) ??
        commission.garment_type.toLowerCase().includes(searchLower)) ||  
        commission.id.toLowerCase().includes(searchLower)
      );
    });
  
  // Handle status update for a commission
  const handleStatusUpdate = async (commissionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/commissions/${commissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Reload the page to show updated data
      // In a real app, you might use state management or SWR/React Query instead
      window.location.reload();
    } catch (error) {
      console.error('Error updating commission status:', error);
      alert('Failed to update commission status. Please try again.');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          {/* Search input */}
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-emerald-700/30 bg-emerald-950/70 pl-10 pr-3 py-2 text-emerald-100 placeholder:text-emerald-600/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
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
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 text-sm rounded-full border ${
                filter === 'approved' 
                  ? 'bg-blue-700/50 text-white border-blue-500/50' 
                  : 'bg-transparent text-emerald-300 border-emerald-700/30 hover:bg-emerald-800/30'
              } transition-colors`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('in progress')}
              className={`px-3 py-1 text-sm rounded-full border ${
                filter === 'in progress' 
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
        </div>
        
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b border-emerald-700/30 text-emerald-200 font-medium text-sm">
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Garment</div>
          <div className="col-span-1">Budget</div>
          <div className="col-span-1">Timeline</div>
          <div className="col-span-2">Submitted</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-3">Actions</div>
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
              {filter !== 'all' 
                ? `There are no ${filter} commissions.` 
                : searchTerm 
                  ? "No commissions match your search criteria." 
                  : "There are no commissions in the system yet."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4 mt-4">
            {filteredCommissions.map((commission, index) => (
              <motion.div
                key={commission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-emerald-900/30 border border-emerald-700/30 rounded-lg p-4"
              >
                {/* Mobile view */}
                <div className="md:hidden space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium capitalize">{commission.garment_type}</h3>
                      <p className="text-sm text-emerald-200/70">
                        {commission.profiles?.full_name ?? commission.profiles?.email ?? "Unknown Customer"}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(commission.status)}`}>
                      {commission.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-emerald-200/70">Budget:</span>
                      <span className="ml-2 text-white">{commission.budget}</span>
                    </div>
                    <div>
                      <span className="text-emerald-200/70">Timeline:</span>
                      <span className="ml-2 text-white">{commission.timeline}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-emerald-200/70">Submitted:</span>
                      <span className="ml-2 text-white">{formatDate(commission.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-700/30">
                    <Link
                      href={`/admin/orders/${commission.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded bg-emerald-800/50 text-emerald-200 text-sm hover:bg-emerald-700/50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View
                    </Link>
                    
                    {commission.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(commission.id, 'approved')}
                        className="inline-flex items-center px-3 py-1.5 rounded bg-blue-800/50 text-blue-200 text-sm hover:bg-blue-700/50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Complete
                      </button>
                    )}
                    
                    {['pending', 'approved'].includes(commission.status.toLowerCase()) && (
                      <button
                        onClick={() => handleStatusUpdate(commission.id, 'cancelled')}
                        className="inline-flex items-center px-3 py-1.5 rounded bg-red-800/50 text-red-200 text-sm hover:bg-red-700/50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Admin Actions Panel */}
      <div className="rounded-lg bg-gradient-to-br from-purple-900/30 to-purple-950/80 backdrop-blur-sm p-6 shadow-2xl border border-purple-700/20">
        <h2 className="text-xl font-bold text-white mb-4">Admin Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-purple-900/30 border border-purple-700/30 p-4 rounded-lg">
            <h3 className="text-purple-200 font-medium text-lg mb-2">Commission Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-300/80">Total Commissions:</span>
                <span className="text-white font-medium">{commissions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-300/80">Pending:</span>
                <span className="text-white font-medium">
                  {commissions.filter(c => c.status.toLowerCase() === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-300/80">In Progress:</span>
                <span className="text-white font-medium">
                  {commissions.filter(c => c.status.toLowerCase() === 'in progress').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-300/80">Completed:</span>
                <span className="text-white font-medium">
                  {commissions.filter(c => c.status.toLowerCase() === 'completed').length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-900/30 border border-purple-700/30 p-4 rounded-lg">
            <h3 className="text-purple-200 font-medium text-lg mb-2">Export Options</h3>
            <div className="space-y-3">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-purple-800/70 text-purple-100 hover:bg-purple-700/70 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export to CSV
              </button>
              
              <button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-purple-800/70 text-purple-100 hover:bg-purple-700/70 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Print Report
              </button>
            </div>
          </div>
          
          <div className="bg-purple-900/30 border border-purple-700/30 p-4 rounded-lg">
            <h3 className="text-purple-200 font-medium text-lg mb-2">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-800/70 text-blue-100 hover:bg-blue-700/70 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Approve All Pending
              </button>
              
              <button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-800/70 text-emerald-100 hover:bg-emerald-700/70 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Send Status Updates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}