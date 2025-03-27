import { fetchAdminCommissions } from "@/app/api/commission/fetchAdminCommissions";
import CommissionsTable from "./components/comissionsTable";


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

export default async function AdminCommissions() {
  
  const commissions = await fetchAdminCommissions();
  const commissionData = JSON.parse(commissions)


  return (
    <main className= "">
        <div className="pb-32 min-h-screen bg-[#002c22] text-emerald-50 ">
          <div className="-mt-40 container mx-auto py-8 px-4">        
              <div className="bg-emerald-900/80 rounded-lg shadow-lg border border-emerald-700/50 overflow-hidden">
              <div className="p-4 bg-emerald-800/70 border-b border-emerald-700/50">
                  <h2 className="text-xl font-semibold text-emerald-100">All Commission Requests</h2>
                  <p className="text-emerald-300">Manage and review all submitted clothing commissions</p>
              </div>
              
              <CommissionsTable 
                  commissionsProps={commissionData}
              />
              </div>
          </div>
        </div>
    </main>

  );
};