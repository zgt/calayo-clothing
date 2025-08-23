import { ReactLenis } from "lenis/react";
import InfinitePhotoGrid from "./_components/InfinitePhotoGrid";
import CircularPhotoLayout from "./_components/CircularPhotoLayout";

export default async function Home() {
  return (
    <>
      <ReactLenis root />
      <main className="flex min-h-screen flex-col items-center justify-center text-white">
        <div className="container mx-auto pt-40 pb-20 md:pt-80">
          <CircularPhotoLayout/>
        </div>
      </main>
    </>
  );
}
