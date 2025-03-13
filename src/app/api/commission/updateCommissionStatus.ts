'use server'
import connectMongoDB from "@/lib/connectMongoDB"
import Commission from '../../model/commission'
import { revalidatePath } from 'next/cache'




export async function updateCommissionStatus(id: string, status: string){
    await connectMongoDB();
    const commish = await Commission.updateOne({_id: id}, {status: status})
    const updated = commish.acknowledged
    revalidatePath('/home/commissions/admin')
    return updated;

}