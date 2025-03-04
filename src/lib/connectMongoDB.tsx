import mongoose from 'mongoose';

const mongoUrl = process.env.MONGODB_URI!;

export default async function connectMongoDB() {
    try{
        await mongoose.connect(mongoUrl)
        console.log("connected to mongo")
    } catch(error){
        console.log("Error connecting to mongo: ", error)
    }
}