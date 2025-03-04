'use server'
import connectMongoDB from "@/lib/connectMongoDB"
import Commission from '../../model/commission'
import { CommissionFormData } from '@/app/home/commissions/page';



export async function submitCommission(formData: CommissionFormData){
    await connectMongoDB();
    const commish = await Commission.create({
        garmentType: formData.garmentType,
        measurements: formData.measurements,
        budget: formData.budget,
        timeline: formData.timeline,
        details: formData.details,
        user_id: formData.user_id
    })
    const commishId = commish._id.toString()
    return commishId

}