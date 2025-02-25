import clientPromise from "../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(){

   try{
    const client = await clientPromise;
    const db = client.db("sample_mflix");
    const movies = await db
            .collection("movies")
            .find({})
            .sort({ metacritic: -1 })
            .limit(10)
            .toArray();
    return NextResponse.json(movies, {status: 200})
   }
   catch (e) {
    console.error(e);
   }
}