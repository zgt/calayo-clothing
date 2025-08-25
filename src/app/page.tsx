import { ReactLenis } from "lenis/react";
import CircularPhotoLayout from "./_components/CircularPhotoLayout";

export default async function Home() {
  return (
    <>
      <ReactLenis root />
      <main className="flex min-h-screen flex-col items-center justify-center text-white">
        <CircularPhotoLayout />
      </main>
    </>
  );
}
