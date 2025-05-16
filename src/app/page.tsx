import PhotoGrid from "./_components/PhotoGrid";


export default async function Home() {


  return (

    <main className="flex min-h-screen flex-col items-center justify-center text-white">
      {/* No additional background here since it will be in the PhotoGrid component */}
      
      <div className="container mx-auto pt-40 md:pt-80 pb-20">
        
        <PhotoGrid />
      </div>
    </main>
  );
}


