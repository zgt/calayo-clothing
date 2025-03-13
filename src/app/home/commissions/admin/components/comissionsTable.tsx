"use client"
import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CommissionData } from "../page";
import toast, { Toaster } from 'react-hot-toast';
import { updateCommissionStatus } from "@/app/api/commission/updateCommissionStatus";

//import { format } from "date-fns";

interface CommissionsTableProps {
  commissionsProps: CommissionData[];
}


export default function CommissionsTable({ commissionsProps}: CommissionsTableProps)  {
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const [commissions, setCommissions] = useState<CommissionData[]>(commissionsProps);


  const handleStatusChange = async (id: string, orderId: number, newStatus: string) => {
    setCommissions(prev => 
      prev.map(commission => 
        commission._id === id 
          ? { ...commission, status: newStatus } 
          : commission
      )
    );

    const updatedCommish = await updateCommissionStatus(id, newStatus);
    if(updatedCommish){
      toast.success(`Commission #${orderId} status changed to ${newStatus}`)
    } else {
      toast.error(`Commission #${orderId} status changed failed`)

    }
    
  };
  
//   const formatDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), "MMM d, yyyy");
//     } catch (e) {
//       return e;
//     }
//   };

  const statusOptions = ["Pending", "In Progress", "Completed", "Cancelled"];
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-900/60 text-yellow-200";
      case "in progress":
        return "bg-blue-900/60 text-blue-200";
      case "completed":
        return "bg-emerald-900/60 text-emerald-200";
      case "cancelled":
        return "bg-red-900/60 text-red-200";
      default:
        return "bg-gray-900/60 text-gray-200";
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table className="text-emerald-50">
          <TableCaption className="text-emerald-300">A list of all commission requests</TableCaption>
          <TableHeader>
            <TableRow className="border-emerald-700/50 hover:bg-emerald-800/50">
              <TableHead className="text-emerald-200">ID</TableHead>
              <TableHead className="text-emerald-200">User</TableHead>
              <TableHead className="text-emerald-200">Garment</TableHead>
              <TableHead className="text-emerald-200">Budget</TableHead>
              <TableHead className="text-emerald-200">Timeline</TableHead>
              <TableHead className="text-emerald-200">Status</TableHead>
              <TableHead className="text-emerald-200">Submitted</TableHead>
              <TableHead className="text-right text-emerald-200">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.map((commission) => (
              <TableRow key={commission.orderId} className="border-emerald-700/30 hover:bg-emerald-800/30">
                <TableCell className="font-medium text-emerald-100">#{commission.orderId}</TableCell>
                <TableCell className="text-emerald-100">{commission.User.name}</TableCell>
                <TableCell className="capitalize text-emerald-100">{commission.garmentType}</TableCell>
                <TableCell className="text-emerald-100">{commission.budget}</TableCell>
                <TableCell className="text-emerald-100">{commission.timeline}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commission.status)}`}>
                      {commission.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-emerald-100">{commission.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-3">
                    <Dialog open={openDetail === commission._id} onOpenChange={(open) => setOpenDetail(open ? commission._id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-300 hover:bg-emerald-800 hover:text-emerald-100">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl bg-emerald-900 border-emerald-700 text-emerald-50">
                        <DialogHeader>
                          <DialogTitle className="text-emerald-100">Commission Details #{commission.orderId}</DialogTitle>
                          <DialogDescription className="text-emerald-300">
                            Submitted on {commission.createdAt} by {commission.User.name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <div>
                            <h3 className="font-semibold text-sm text-emerald-300 mb-1">Garment Type</h3>
                            <p className="capitalize text-emerald-100">{commission.garmentType}</p>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-sm text-emerald-300 mb-1">Budget Range</h3>
                            <p className="text-emerald-100">{commission.budget}</p>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-sm text-emerald-300 mb-1">Timeline</h3>
                            <p className="text-emerald-100">{commission.timeline}</p>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-sm text-emerald-300 mb-1">Status</h3>
                            <Select 
                              value={commission.status} 
                              onValueChange={(value) => handleStatusChange(commission._id, commission.orderId,  value)}
                            >
                              <SelectTrigger className="bg-emerald-800 border-emerald-700 text-emerald-100">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent className="bg-emerald-800 border-emerald-700 text-emerald-100">
                                <SelectGroup>
                                  {statusOptions.map(status => (
                                    <SelectItem key={status} value={status} className="text-emerald-100 focus:bg-emerald-700 focus:text-emerald-50">
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="col-span-2">
                            <h3 className="font-semibold text-sm text-emerald-300 mb-1">Measurements (inches)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-emerald-300">Chest</p>
                                <p className="text-emerald-100">{commission.measurements.chest}&quot;</p>
                              </div>
                              <div>
                                <p className="text-xs text-emerald-300">Waist</p>
                                <p className="text-emerald-100">{commission.measurements.waist}&quot;</p>
                              </div>
                              <div>
                                <p className="text-xs text-emerald-300">Hips</p>
                                <p className="text-emerald-100">{commission.measurements.hips}&quot;</p>
                              </div>
                              <div>
                                <p className="text-xs text-emerald-300">Length</p>
                                <p className="text-emerald-100">{commission.measurements.length}&quot;</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-span-2">
                            <h3 className="font-semibold text-sm text-emerald-300 mb-1">Additional Details</h3>
                            <p className="bg-emerald-800/60 p-3 rounded-md text-emerald-100">{commission.details}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Select 
                            value={commission.status} 
                            onValueChange={(value) => handleStatusChange(commission._id, commission.orderId, value)}
                          >
                            <SelectTrigger className="w-[130px] bg-emerald-800/50 border-emerald-700 text-emerald-100">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent className="bg-emerald-800 border-emerald-700">
                              {statusOptions.map(status => (
                                <SelectItem key={status} value={status} className="text-emerald-100 focus:bg-emerald-700 focus:text-emerald-50">
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TooltipTrigger>
                        <TooltipContent className="bg-emerald-800 text-emerald-100 border-emerald-700">
                          <p>Update commission status</p>
                        </TooltipContent>
                        <Toaster
                          position= 'bottom-right'/>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
