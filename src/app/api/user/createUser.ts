import connectMongoDB from "@/lib/connectMongoDB"
import User from "@/app/model/user"

export async function createUser(name:string, email:string){
    await connectMongoDB();
    const user = await User.create({name, email})
    const userId = user._id.toString()
    return userId
}