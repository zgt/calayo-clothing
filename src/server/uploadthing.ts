import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { auth, type User } from "~/lib/auth";
import { headers } from "next/headers";

// Initialize UploadThing API with server token
export const utapi = new UTApi({
  fetch: globalThis.fetch,
  token: process.env.UPLOADTHING_TOKEN,
});

const f = createUploadthing();

export const ourFileRouter = {
  instagramUploader: f({ image: { maxFileSize: "16MB", maxFileCount: 50 } })
    .middleware(async () => {
      // Verify admin access using Better-Auth
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      const user = session.user as User;
      if (user.role !== "admin") {
        throw new Error("Admin access required");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      console.log("Upload complete for userId:", metadata.userId);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
