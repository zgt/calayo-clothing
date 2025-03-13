'use server'
import connectMongoDB from "@/lib/connectMongoDB"
import Commission from '../../model/commission'
import { CommissionFormData } from '@/app/home/commissions/page';
import { revalidatePath } from 'next/cache'



export async function submitCommission(formData: CommissionFormData){
    await connectMongoDB();
    const commish = await Commission.create({
        garmentType: formData.garmentType,
        measurements: formData.measurements,
        budget: formData.budget,
        timeline: formData.timeline,
        details: formData.details,
        User: formData.user_id,
        status: formData.status
    })
    const commishId = commish._id.toString()
    revalidatePath('/home/commissions/admin')
    return commishId

}