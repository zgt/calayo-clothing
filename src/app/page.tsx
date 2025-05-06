import Link from "next/link";

import { HydrateClient } from "~/trpc/server";
import PhotoGrid from "./_components/PhotoGrid";


export default async function Home() {


  return (
    // <HydrateClient>
    //   <main className="flex min-h-screen flex-col  justify-center text-white">
    //      <PhotoGrid/>
    //   </main>
    // </HydrateClient>

    <main className="flex min-h-screen flex-col items-center justify-center text-white">
      {/* No additional background here since it will be in the PhotoGrid component */}
      
      <div className="container mx-auto pt-80 pb-20">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Calayo <span className="text-emerald-400">Collection</span>
        </h1>
        
        <PhotoGrid />
      </div>
    </main>
  );
}


