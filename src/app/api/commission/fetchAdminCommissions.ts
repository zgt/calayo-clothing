'use server'
import connectMongoDB from "@/lib/connectMongoDB"
import Commission from '@/app/model/commission'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from '@/app/model/user'



export async function fetchAdminCommissions(){
    try{
        await connectMongoDB();
        const commishes = await Commission.find().populate('User')
        return JSON.stringify(commishes)
    } catch (err: unknown) {
        console.log(err)
        let errorMessage = "Error"
        if(err instanceof Error){
            errorMessage = err.message
        }
        return errorMessage
     }
}