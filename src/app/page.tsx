import { ReactLenis } from 'lenis/react'
import InfinitePhotoGrid from './_components/InfinitePhotoGrid';


export default async function Home() {


  return (
    <>
      <ReactLenis root />
        <main className="flex min-h-screen flex-col items-center justify-center text-white">
          <div className="container mx-auto pt-40 md:pt-80 pb-20">
            <InfinitePhotoGrid />
          </div>
        </main>
    </>
  );
}


