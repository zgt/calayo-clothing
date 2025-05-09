import connectMongoDB from "@/lib/connectMongoDB"
import User from "@/app/model/user"
import { NextResponse } from "next/server";

export async function POST(request) {
    const {name, email} = await request.json();
    await connectMongoDB();
    const user = await User.create({name, email})
    return NextResponse.json({message: "user registered", user: user}, {status: 201})
}