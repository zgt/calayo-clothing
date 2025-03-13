'use server'
import connectMongoDB from "@/lib/connectMongoDB"
import Commission from '../../model/commission'



export async function fetchAdminCommissions(){
    try{
        await connectMongoDB();
        const commishes = await Commission.find().populate('User')
        console.log(commishes)
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