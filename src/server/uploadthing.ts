import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { createClient } from "~/utils/supabase/server";

// Initialize UploadThing API with server token
export const utapi = new UTApi({
  fetch: globalThis.fetch,
  token: process.env.UPLOADTHING_TOKEN,
});

const f = createUploadthing();

export const ourFileRouter = {
  instagramUploader: f({ image: { maxFileSize: "16MB", maxFileCount: 50 } })
    .middleware(async () => {
      // Verify admin access
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        throw new Error("Unauthorized");
      }
      
      const adminId = process.env.NEXT_PUBLIC_ADMIN_ID;
      if (user.id !== adminId) {
        throw new Error("Admin access required");
      }
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.ufsUrl);
      
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;