"use client"
import { UserCommissionsTable } from "./components/userCommissionsTable";
import { fetchUserCommissions } from "@/app/api/commission/fetchUserCommissions";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


export interface CommissionData {
  _id: string;
  orderId: number;
  User: {
    email: string;
    name: string;
    id: string;
  };
  garmentType: string;
  measurements: {
    chest: string;
    waist: string;
    hips: string;
    length: string;
  };
  budget: string;
  timeline: string;
  details: string;
  status: string;
  createdAt: string;
}

export default function UserOrders() {
  const { data: session } = useSession()
  const [commissionData, setCommissionData] = useState<CommissionData[]>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getUserCommissions(){
      const userObjectId = session?.user?.mongoId
      console.log(userObjectId)
      const commissions = await fetchUserCommissions(userObjectId!);
      const commissionJSON = await JSON.parse(commissions)
      setCommissionData(commissionJSON)
      setLoading(false)
      console.log(commissionData)
    }
    getUserCommissions()
  }, [])
  


  return (
    <main className= "-mt-32">
        <div className="min-h-screen bg-[#002c22] text-emerald-50">
        <div className="-mt-32 container mx-auto py-8 px-4">        
            <div className="bg-emerald-900/80 rounded-lg shadow-lg border border-emerald-700/50 overflow-hidden">
            <div className="p-4 bg-emerald-800/70 border-b border-emerald-700/50">
                <h2 className="text-xl font-semibold text-emerald-100">Your Commission Requests</h2>
                <p className="text-emerald-300">View all submitted clothing commissions</p>
            </div>
            {loading ? (
              <></>
            ) : (
              <UserCommissionsTable
              commissionsProps={commissionData!}
          />
            )}
            </div>
        </div>
        </div>
    </main>

  );
};