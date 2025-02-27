'use server'
import mongoose from 'mongoose';
import Commission from '../../model/commission'
import { CommissionFormData } from '@/app/home/commissions/page';

const mongoUrl = process.env.MONGODB_URI!;


export async function submitCommission(formData: CommissionFormData){
    mongoose.connect(mongoUrl)
    const commish = await Commission.create({
        garmentType: formData.garmentType
    })
    const commishId = commish._id.toString()
    return commishId

}