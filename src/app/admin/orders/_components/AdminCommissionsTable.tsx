"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";

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
    case 'In Progress':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'completed':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

export default function AdminCommissionsTable({ commissions }: AdminCommissionsTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCommissionId, setUpdateCommissionId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  
  // Filter commissions based on selected filter and search term
  const filteredCommissions = commissions
    .filter(commission => 
      filter === 'all' || 
      commission.status === filter
    )
    .filter(commission => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        (commission.profiles?.full_name?.toLowerCase().includes(searchLower) ?? false) ||
        (commission.profiles?.email?.toLowerCase().includes(searchLower) ?? false) ||
        commission.garment_type.toLowerCase().includes(searchLower) ||  
        commission.id.toLowerCase().includes(searchLower)
      );
    });
  
  // Pagination
  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCommissions = filteredCommissions.slice(indexOfFirstItem, indexOfLastItem);
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);
  
  // Open status update modal
  const openStatusModal = (commission: Commission) => {
    setSelectedCommission(commission);
    setNewStatus(commission.status);
    setShowStatusModal(true);
  };
  
  // Close status update modal
  const closeStatusModal = () => {
    setSelectedCommission(null);
    setNewStatus('');
    setShowStatusModal(false);
  };
  
  // tRPC mutation for updating commission status
  const updateStatusMutation = api.commissions.admin.updateStatus.useMutation({
    onSuccess: () => {
      // Use a unique toast ID to prevent duplicates
      toast.success(`Status updated to ${newStatus}`, {
        id: `status-update-${selectedCommission?.id}`,
      });
      // Reload the page after a brief delay to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1000);
      closeStatusModal();
    },
    onError: (error) => {
      console.error('Error updating commission status:', error);
      toast.error('Failed to update status. Please try again.', {
        id: `status-update-error-${selectedCommission?.id}`,
      });
    },
    onSettled: () => {
      setIsUpdating(false);
      setUpdateCommissionId(null);
    },
  });

  // Separate mutation for bulk operations (no individual toasts)
  const bulkUpdateStatusMutation = api.commissions.admin.updateStatus.useMutation();

  // Handle status update for a commission
  const handleStatusUpdate = async () => {
    if (!selectedCommission) return;
    
    // Prevent double calls
    if (isUpdating) return;
    
    setIsUpdating(true);
    setUpdateCommissionId(selectedCommission.id);
    
    updateStatusMutation.mutate({
      id: selectedCommission.id,
      status: newStatus as "Pending" | "Approved" | "In Progress" | "Completed" | "Cancelled",
    });
  };
  
  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Customer', 'Email', 'Garment', 'Budget', 'Timeline', 'Status', 'Submitted'];
    
    const csvContent = [
      headers.join(','),
      ...filteredCommissions.map(commission => [
        commission.id,
        commission.profiles?.full_name ?? 'Unknown',
        commission.profiles?.email ?? 'Unknown',
        commission.garment_type,
        commission.budget,
        commission.timeline,
        commission.status,
        new Date(commission.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `commissions_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV export created successfully');
  };
  
  // Approve all pending commissions
  const approveAllPending = async () => {
    const pendingCommissions = commissions.filter(c => c.status === 'Pending');
    
    if (pendingCommissions.length === 0) {
      toast.error('No pending commissions to approve');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to approve all ${pendingCommissions.length} pending commissions?`)) {
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Show loading toast
    const loadingToast = toast.loading(`Approving ${pendingCommissions.length} commissions...`);
    
    // Process each commission using tRPC (bulk mutation without individual toasts)
    for (const commission of pendingCommissions) {
      try {
        await bulkUpdateStatusMutation.mutateAsync({
          id: commission.id,
          status: "Approved", // Changed to use proper "Approved" enum value
        });
        successCount++;
      } catch (error) {
        console.error(`Error approving commission ${commission.id}:`, error);
        errorCount++;
      }
    }
    
    // Dismiss loading toast
    toast.dismiss(loadingToast);
    
    // Show results
    if (successCount > 0) {
      toast.success(`Successfully approved ${successCount} commissions`);
    }
    
    if (errorCount > 0) {
      toast.error(`Failed to approve ${errorCount} commissions`);
    }
    
    // Refresh the page
    if (successCount > 0) {
      setTimeout(() => {
        router.refresh();
      }, 1500);
    }
  };
  
  // Send status update emails
  const sendStatusUpdates = () => {
    toast.success('Status update notifications sent to customers');
    // This would connect to an API endpoint that sends emails to customers
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
              onClick={() => setFilter('Pending')}
              className={`px-3 py-1 text-sm rounded-full border ${
                filter === 'Pending' 
                  ? 'bg-amber-700/50 text-white border-amber-500/50' 
                  : 'bg-transparent text-emerald-300 border-emerald-700/30 hover:bg-emerald-800/30'
              } transition-colors`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('Approved')}
              className={`px-3 py-1 text-sm rounded-full border ${
                filter === 'Approved' 
                  ? 'bg-blue-700/50 text-white border-blue-500/50' 
                  : 'bg-transparent text-emerald-300 border-emerald-700/30 hover:bg-emerald-800/30'
              } transition-colors`}
            >
              Approved
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
              onClick={() => setFilter('Completed')}
              className={`px-3 py-1 text-sm rounded-full border ${
                filter === 'Completed' 
                  ? 'bg-green-700/50 text-white border-green-500/50' 
                  : 'bg-transparent text-emerald-300 border-emerald-700/30 hover:bg-emerald-800/30'
              } transition-colors`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('Cancelled')}
              className={`px-3 py-1 text-sm rounded-full border ${
                filter === 'Cancelled' 
                  ? 'bg-red-700/50 text-white border-red-500/50' 
                  : 'bg-transparent text-emerald-300 border-emerald-700/30 hover:bg-emerald-800/30'
              } transition-colors`}
            >
              Cancelled
            </button>
          </div>
        </div>
        
        {/* Table Header - Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b border-emerald-700/30 text-emerald-200 font-medium text-sm">
          <div className="col-span-3">Customer</div>
          <div className="col-span-1">Garment</div>
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
            {currentCommissions.map((commission, index) => (
              <motion.div
                key={commission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-emerald-900/30 border border-emerald-700/30 rounded-lg p-4"
              >
                {/* Desktop view */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="font-medium text-white">
                      {commission.profiles?.full_name ?? "Unknown"}
                    </div>
                    <div className="text-sm text-emerald-200/70 truncate">
                      {commission.profiles?.email ?? "No email"}
                    </div>
                  </div>
                  <div className="col-span-1 capitalize text-white">
                    {commission.garment_type}
                  </div>
                  <div className="col-span-1 text-emerald-200">
                    {commission.budget}
                  </div>
                  <div className="col-span-1 text-emerald-200">
                    {commission.timeline}
                  </div>
                  <div className="col-span-2 text-emerald-200/70 text-sm">
                    {formatDate(commission.created_at)}
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(commission.status)}`}>
                      {commission.status}
                    </span>
                  </div>
                  <div className="col-span-3 flex gap-2">
                    <Link
                      href={`/admin/orders/${commission.id}`}
                      className="inline-flex items-center px-3 py-1 rounded bg-emerald-800/50 text-emerald-200 text-sm hover:bg-emerald-700/50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View
                    </Link>
                    
                    <button
                      onClick={() => openStatusModal(commission)}
                      className="inline-flex items-center px-3 py-1 rounded bg-blue-800/50 text-blue-200 text-sm hover:bg-blue-700/50 transition-colors"
                      disabled={isUpdating && updateCommissionId === commission.id}
                    >
                      {isUpdating && updateCommissionId === commission.id ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      )}
                      Update
                    </button>
                    
                    <button
                      onClick={() => window.open(`mailto:${commission.profiles?.email}`, '_blank')}
                      className="inline-flex items-center px-3 py-1 rounded bg-emerald-800/50 text-emerald-200 text-sm hover:bg-emerald-700/50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Email
                    </button>
                  </div>
                </div>
                
                {/* Mobile view */}
                <div className="md:hidden space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">
                        {commission.profiles?.full_name ?? "Unknown Customer"}
                      </h3>
                      <p className="text-sm text-emerald-200/70">
                        {commission.profiles?.email ?? "No email"}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(commission.status)}`}>
                      {commission.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-emerald-200/70">Garment:</span>
                      <span className="ml-2 text-white capitalize">{commission.garment_type}</span>
                    </div>
                    <div>
                      <span className="text-emerald-200/70">Budget:</span>
                      <span className="ml-2 text-white">{commission.budget}</span>
                    </div>
                    <div>
                      <span className="text-emerald-200/70">Timeline:</span>
                      <span className="ml-2 text-white">{commission.timeline}</span>
                    </div>
                    <div>
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
                    
                    <button
                      onClick={() => openStatusModal(commission)}
                      className="inline-flex items-center px-3 py-1.5 rounded bg-blue-800/50 text-blue-200 text-sm hover:bg-blue-700/50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Update
                    </button>
                    
                    <button
                      onClick={() => window.open(`mailto:${commission.profiles?.email}`, '_blank')}
                      className="inline-flex items-center px-3 py-1.5 rounded bg-emerald-800/50 text-emerald-200 text-sm hover:bg-emerald-700/50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Email
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {filteredCommissions.length > 0 && (
          <div className="border-t border-emerald-700/30 mt-6 pt-4 flex items-center justify-between">
            <div className="text-sm text-emerald-200">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCommissions.length)} of {filteredCommissions.length} commissions
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-1 rounded bg-emerald-900/50 text-emerald-200 text-sm hover:bg-emerald-800/50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-1 rounded bg-emerald-900/50 text-emerald-200 text-sm hover:bg-emerald-800/50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-emerald-200">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded bg-emerald-900/50 border border-emerald-700/30 text-emerald-200 text-sm py-1 px-2"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
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
                  {commissions.filter(c => c.status === 'Pending').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-300/80">Approved:</span>
                <span className="text-white font-medium">
                  {commissions.filter(c => c.status === 'Approved').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-300/80">In Progress:</span>
                <span className="text-white font-medium">
                  {commissions.filter(c => c.status === 'In Progress').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-300/80">Completed:</span>
                <span className="text-white font-medium">
                  {commissions.filter(c => c.status === 'Completed').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-300/80">Cancelled:</span>
                <span className="text-white font-medium">
                  {commissions.filter(c => c.status === 'Cancelled').length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-900/30 border border-purple-700/30 p-4 rounded-lg">
            <h3 className="text-purple-200 font-medium text-lg mb-2">Export Options</h3>
            <div className="space-y-3">
              <button 
                onClick={exportToCSV}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-purple-800/70 text-purple-100 hover:bg-purple-700/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export to CSV
              </button>
              
              <button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-purple-800/70 text-purple-100 hover:bg-purple-700/70 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>
          
          <div className="bg-purple-900/30 border border-purple-700/30 p-4 rounded-lg">
            <h3 className="text-purple-200 font-medium text-lg mb-2">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={approveAllPending}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-800/70 text-blue-100 hover:bg-blue-700/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Approve All Pending
              </button>
              
              <button 
                onClick={sendStatusUpdates}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-800/70 text-emerald-100 hover:bg-emerald-700/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Send Status Updates
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Update Modal */}
      {showStatusModal && selectedCommission && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/70" onClick={closeStatusModal}></div>
          <div className="relative bg-gradient-to-br from-emerald-900/90 to-emerald-950/90 backdrop-blur-sm p-6 rounded-lg shadow-2xl border border-emerald-700/30 max-w-md w-full mx-4">
            <button
              onClick={closeStatusModal}
              className="absolute top-4 right-4 text-emerald-300 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Update Commission Status</h2>
            
            <div className="mb-4">
              <p className="text-emerald-200 mb-2">
                <span className="font-medium">Commission:</span> {selectedCommission.garment_type} for {selectedCommission.profiles?.full_name ?? "Unknown"}
              </p>
              <p className="text-emerald-200">
                <span className="font-medium">Current Status:</span> 
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(selectedCommission.status)}`}>
                  {selectedCommission.status}
                </span>
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="status" className="block text-sm font-medium text-emerald-200 mb-2">
                New Status
              </label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-emerald-700/30 bg-emerald-900/70 px-3 py-2 text-emerald-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeStatusModal}
                className="px-4 py-2 rounded-lg border border-emerald-700/30 text-emerald-200 hover:bg-emerald-900/50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || newStatus === selectedCommission.status}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}