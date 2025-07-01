import {
  createTRPCRouter,
  adminProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { fetchUserMedia } from "~/app/api/instagram/fetchUserMedia";
import { fetchChildrenIds } from "~/app/api/instagram/fetchChildrenIds";
import { fetchChildrenMedia } from "~/app/api/instagram/fetchChildrenMedia";
import { utapi } from "~/server/uploadthing";

// Extended type for stored photos with UploadThing URLs
interface StoredPhoto {
  id: string;
  parentId: string;
  uploadthingUrl: string;
  originalUrl: string;
  isParent: boolean;
  customId?: string;
  createdAt: Date;
}

// In-memory storage for now (you might want to use a database later)
let storedPhotos: StoredPhoto[] = [];

export const instagramRouter = createTRPCRouter({
  getStoredPhotos: publicProcedure.query(async () => {
    try {
      const listFilesResponse = await utapi.listFiles();

      if (!listFilesResponse?.files) {
        return [];
      }

      const { files } = listFilesResponse;

      const mediaFiles = files.filter((file) => {
        const fileName = file.name.toLowerCase();
        const isMediaFile =
          fileName.endsWith(".jpg") ||
          fileName.endsWith(".jpeg") ||
          fileName.endsWith(".png") ||
          fileName.endsWith(".webp") ||
          fileName.endsWith(".mp4") ||
          fileName.endsWith(".mov") ||
          fileName.endsWith(".webm");
        return isMediaFile && file.status === "Uploaded";
      });

      if (mediaFiles.length === 0) {
        return [];
      }

      const uploadthingAppId = process.env.UPLOADTHING_APP_ID;
      if (!uploadthingAppId) {
        throw new Error("UPLOADTHING_APP_ID environment variable is not set");
      }

      const parents: Array<{
        parentId: string;
        mediaUrl: string;
        children: Array<{
          id: string;
          parentId: string;
          mediaUrl: string;
          isImage: boolean;
        }>;
      }> = [];

      const childrenByParentId: Record<
        string,
        Array<{
          id: string;
          parentId: string;
          mediaUrl: string;
          isImage: boolean;
        }>
      > = {};

      mediaFiles.forEach((file) => {
        const mediaUrl = `https://${uploadthingAppId}.ufs.sh/f/${file.key}`;

        if (file.name.startsWith("parent-")) {
          const parentId = file.name.substring(7).split(".")[0];
          if (parentId) {
            parents.push({
              parentId,
              mediaUrl,
              children: [],
            });
          }
        } else if (file.name.startsWith("child-")) {
          const nameParts = file.name.substring(6).split("-");
          if (nameParts.length >= 2) {
            const parentId = nameParts[0];
            const childId = nameParts[1]?.split(".")[0];

            if (parentId && childId) {
              const fileName = file.name.toLowerCase();
              // Check if it's a video file by extension
              const isVideo =
                fileName.endsWith(".mp4") ||
                fileName.endsWith(".mov") ||
                fileName.endsWith(".webm") ||
                fileName.endsWith(".avi") ||
                fileName.endsWith(".mkv");

              const isImage = !isVideo;

              childrenByParentId[parentId] ??= [];
              childrenByParentId[parentId].push({
                id: childId,
                parentId,
                mediaUrl,
                isImage,
              });
            }
          }
        }
      });

      parents.forEach((parent) => {
        const children = childrenByParentId[parent.parentId];
        if (children) {
          parent.children = children;
        }
      });

      return parents;
    } catch (error) {
      console.error("Error fetching stored photos:", error);
      return [];
    }
  }),

  // Admin-only endpoint to sync Instagram photos to UploadThing
  syncInstagramPhotos: adminProcedure.mutation(async () => {
    console.log("Starting Instagram photo sync process");
    
    try {
      // Fetch existing files from UploadThing
      console.log("Fetching existing files from UploadThing");
      let existingFilesResponse;
      try {
        existingFilesResponse = await utapi.listFiles();
        const existingFiles = existingFilesResponse?.files || [];
        console.log(`Found ${existingFiles.length} existing files in UploadThing`);
      } catch (error) {
        console.error("Failed to fetch existing files from UploadThing:", error);
        console.error("UploadThing API error details:", error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to fetch existing files: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
      const existingFiles = existingFilesResponse?.files || [];
      
      // Create sets of existing parent and child IDs for quick lookup
      const existingParentIds = new Set<string>();
      const existingChildParentIds = new Set<string>();
      
      existingFiles.forEach((file) => {
        if (file.name.startsWith("parent-")) {
          const parentId = file.name.substring(7).split(".")[0];
          if (parentId) {
            existingParentIds.add(parentId);
          }
        } else if (file.name.startsWith("child-")) {
          const nameParts = file.name.substring(6).split("-");
          if (nameParts.length >= 2) {
            const parentId = nameParts[0];
            if (parentId) {
              existingChildParentIds.add(parentId);
            }
          }
        }
      });

      console.log(`Found ${existingParentIds.size} existing parent photos and ${existingChildParentIds.size} parent IDs with children`);

      // Fetch Instagram media
      console.log("Fetching Instagram media from API");
      let instagramMedia;
      try {
        instagramMedia = await fetchUserMedia();
        console.log(`Successfully fetched ${instagramMedia.length} Instagram media items`);
      } catch (error) {
        console.error("Failed to fetch Instagram media:", error);
        console.error("Instagram API error details:", error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to fetch Instagram media: ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      // Filter out items that already exist
      const newInstagramMedia = instagramMedia.filter((item) => {
        if (!item?.id) return false;
        return !existingParentIds.has(item.id);
      });

      console.log(`Found ${instagramMedia.length} Instagram photos, ${existingParentIds.size} already exist, uploading ${newInstagramMedia.length} new photos`);

      const uploadPromises = newInstagramMedia
        .slice(0, 10) // Limit to first 10 for testing
        .map(async (item) => {
          console.log(`Processing Instagram media item: ${item.id}`);
          try {
            // Fetch parent photo
            console.log(`Fetching parent photo for item ${item.id} from: ${item.media_url}`);
            const parentResponse = await fetch(item.media_url);
            if (!parentResponse.ok) {
              console.error(`Failed to fetch parent image for ${item.id}: HTTP ${parentResponse.status} - ${parentResponse.statusText}`);
              throw new Error(
                `Failed to fetch parent image: ${parentResponse.status}`,
              );
            }
            const parentBlob = await parentResponse.blob();
            console.log(`Successfully fetched parent photo for ${item.id}, size: ${parentBlob.size} bytes, type: ${parentBlob.type}`);

            // Determine proper file extension based on blob type
            const parentMimeType = parentBlob.type;
            let parentFileExtension = ".jpg"; // default

            if (parentMimeType.startsWith("video/")) {
              if (parentMimeType.includes("mp4")) parentFileExtension = ".mp4";
              else if (parentMimeType.includes("webm"))
                parentFileExtension = ".webm";
              else if (
                parentMimeType.includes("quicktime") ||
                parentMimeType.includes("mov")
              )
                parentFileExtension = ".mov";
              else parentFileExtension = ".mp4"; // default video extension
            } else if (parentMimeType.startsWith("image/")) {
              if (parentMimeType.includes("png")) parentFileExtension = ".png";
              else if (parentMimeType.includes("webp"))
                parentFileExtension = ".webp";
              else if (
                parentMimeType.includes("jpeg") ||
                parentMimeType.includes("jpg")
              )
                parentFileExtension = ".jpg";
              else parentFileExtension = ".jpg"; // default image extension
            }

            // Convert blob to File for UploadThing
            const parentFile = new File(
              [parentBlob],
              `parent-${item.id}${parentFileExtension}`,
              {
                type: parentBlob.type || "image/jpeg",
              },
            );

            // Upload parent photo to UploadThing
            console.log(`Uploading parent photo for ${item.id} to UploadThing`);
            let parentUpload;
            try {
              parentUpload = await utapi.uploadFiles(parentFile);
            } catch (error) {
              console.error(`Failed to upload parent photo for ${item.id} to UploadThing:`, error);
              console.error(`Upload error details:`, error instanceof Error ? error.message : String(error));
              throw new Error(`Failed to upload parent photo: ${error instanceof Error ? error.message : "Upload failed"}`);
            }

            if (!parentUpload.data) {
              console.error(`Failed to upload parent photo for ${item.id}: Upload returned no data`);
              console.error(`Upload response:`, parentUpload);
              throw new Error("Failed to upload parent photo");
            }
            
            console.log(`Successfully uploaded parent photo for ${item.id} to: ${parentUpload.data.ufsUrl}`);

            // Store parent photo info
            const parentPhoto: StoredPhoto = {
              id: item.id,
              parentId: item.id,
              uploadthingUrl: parentUpload.data.ufsUrl,
              originalUrl: item.media_url,
              isParent: true,
              createdAt: new Date(),
            };

            // Fetch and upload children (only if parent doesn't already have children uploaded)
            const childPhotos: StoredPhoto[] = [];
            try {
              // Skip children if this parent already has children uploaded
              if (!existingChildParentIds.has(item.id)) {
                console.log(`Fetching children for parent ${item.id}`);
                const childrenIds = await fetchChildrenIds(item.id);
                console.log(`Found ${childrenIds.length} children IDs for parent ${item.id}`);
                
                const childrenMedia = await fetchChildrenMedia(childrenIds);
                console.log(`Successfully fetched ${childrenMedia.length} children media items for parent ${item.id}`);

                for (const child of childrenMedia) {
                try {
                  console.log(`Processing child media from URL: ${child.mediaUrl}`);
                  const childResponse = await fetch(child.mediaUrl);
                  if (!childResponse.ok) {
                    console.error(`Failed to fetch child media: HTTP ${childResponse.status} - ${childResponse.statusText}`);
                    continue;
                  }

                  const childBlob = await childResponse.blob();
                  console.log(`Successfully fetched child media, size: ${childBlob.size} bytes, type: ${childBlob.type}`);

                  // Determine proper file extension based on blob type
                  const mimeType = childBlob.type;
                  let fileExtension = ".jpg"; // default

                  if (mimeType.startsWith("video/")) {
                    if (mimeType.includes("mp4")) fileExtension = ".mp4";
                    else if (mimeType.includes("webm")) fileExtension = ".webm";
                    else if (
                      mimeType.includes("quicktime") ||
                      mimeType.includes("mov")
                    )
                      fileExtension = ".mov";
                    else fileExtension = ".mp4"; // default video extension
                  } else if (mimeType.startsWith("image/")) {
                    if (mimeType.includes("png")) fileExtension = ".png";
                    else if (mimeType.includes("webp")) fileExtension = ".webp";
                    else if (
                      mimeType.includes("jpeg") ||
                      mimeType.includes("jpg")
                    )
                      fileExtension = ".jpg";
                    else fileExtension = ".jpg"; // default image extension
                  }

                  // Convert blob to File for UploadThing
                  const childFile = new File(
                    [childBlob],
                    `child-${item.id}-${Date.now()}${fileExtension}`,
                    {
                      type: childBlob.type || "image/jpeg",
                    },
                  );

                  // Upload child photo to UploadThing
                  console.log(`Uploading child photo to UploadThing`);
                  let childUpload;
                  try {
                    childUpload = await utapi.uploadFiles(childFile);
                  } catch (error) {
                    console.error(`Failed to upload child photo to UploadThing:`, error);
                    console.error(`Child upload error details:`, error instanceof Error ? error.message : String(error));
                    continue; // Skip this child and continue with the next one
                  }

                  if (childUpload.data) {
                    console.log(`Successfully uploaded child photo to: ${childUpload.data.ufsUrl}`);
                    childPhotos.push({
                      id: `${item.id}-${Date.now()}-${Math.random()}`,
                      parentId: item.id,
                      uploadthingUrl: childUpload.data.ufsUrl,
                      originalUrl: child.mediaUrl,
                      isParent: false,
                      customId: item.id,
                      createdAt: new Date(),
                    });
                  } else {
                    console.error(`Failed to upload child photo: Upload returned no data`);
                    console.error(`Child upload response:`, childUpload);
                  }
                } catch (error) {
                  console.error(`Error processing child photo for parent ${item.id}:`, error);
                  console.error(`Child media URL: ${child.mediaUrl}`);
                  console.error(`Error details:`, error instanceof Error ? error.message : String(error));
                }
                }
              } else {
                console.log(`Skipping children for ${item.id} - already exist`);
              }
            } catch (error) {
              console.error(`Error fetching children for ${item.id}:`, error);
              console.error(`Children fetch error details:`, error instanceof Error ? error.message : String(error));
            }

            console.log(`Completed processing item ${item.id}: 1 parent, ${childPhotos.length} children`);
            return {
              parent: parentPhoto,
              children: childPhotos,
            };
          } catch (error) {
            console.error(`Error processing item ${item.id}:`, error);
            console.error(`Item processing error details:`, error instanceof Error ? error.message : String(error));
            console.error(`Item media URL: ${item.media_url}`);
            return null;
          }
        });

      console.log("Waiting for all upload promises to complete");
      const results = await Promise.all(uploadPromises);
      const validResults = results.filter(Boolean);
      const failedResults = results.length - validResults.length;

      console.log(`Upload results: ${validResults.length} successful, ${failedResults} failed`);

      // Store all photos
      storedPhotos = [];
      validResults.forEach((result) => {
        if (result) {
          storedPhotos.push(result.parent);
          storedPhotos.push(...result.children);
        }
      });

      const finalStats = {
        success: true,
        totalPhotos: storedPhotos.length,
        parentPhotos: storedPhotos.filter((p) => p.isParent).length,
        childPhotos: storedPhotos.filter((p) => !p.isParent).length,
        totalInstagramPhotos: instagramMedia.length,
        existingPhotos: existingParentIds.size,
        newPhotosUploaded: validResults.length,
        failedUploads: failedResults,
        skippedPhotos: instagramMedia.length - newInstagramMedia.length,
      };

      console.log("Instagram photo sync completed successfully:", finalStats);
      return finalStats;
    } catch (error) {
      console.error("Error syncing Instagram photos:", error);
      console.error("Sync error details:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      
      throw new Error(
        `Failed to sync Instagram photos: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }),

  // Clear all stored photos (admin only)
  clearStoredPhotos: adminProcedure.mutation(() => {
    storedPhotos = [];
    return { success: true, message: "All stored photos cleared" };
  }),

  // Get sync status
  getSyncStatus: adminProcedure.query(() => {
    return {
      totalPhotos: storedPhotos.length,
      parentPhotos: storedPhotos.filter((p) => p.isParent).length,
      childPhotos: storedPhotos.filter((p) => !p.isParent).length,
      lastSyncTime:
        storedPhotos.length > 0
          ? Math.max(...storedPhotos.map((p) => p.createdAt.getTime()))
          : null,
    };
  }),

  // Get all instagram photos from UploadThing in a single array
  getAllInstagramPhotos: publicProcedure.query(async () => {
    try {
      const listFilesResponse = await utapi.listFiles();

      if (!listFilesResponse?.files) {
        return [];
      }

      const { files } = listFilesResponse;

      const mediaFiles = files.filter((file) => {
        const fileName = file.name.toLowerCase();
        const isImageFile =
          fileName.endsWith(".jpg") ||
          fileName.endsWith(".jpeg") ||
          fileName.endsWith(".png") ||
          fileName.endsWith(".webp");
        return isImageFile && file.status === "Uploaded";
      });

      if (mediaFiles.length === 0) {
        return [];
      }

      const uploadthingAppId = process.env.UPLOADTHING_APP_ID;
      if (!uploadthingAppId) {
        throw new Error("UPLOADTHING_APP_ID environment variable is not set");
      }

      const allPhotos = mediaFiles
        .filter((file) => file.name.startsWith("child-")) // Only include child photos
        .map((file) => {
          const mediaUrl = `https://${uploadthingAppId}.ufs.sh/f/${file.key}`;
          const fileName = file.name.toLowerCase();
          const isVideo =
            fileName.endsWith(".mp4") ||
            fileName.endsWith(".mov") ||
            fileName.endsWith(".webm") ||
            fileName.endsWith(".avi") ||
            fileName.endsWith(".mkv");

          let id = "";
          let parentId = "";

          const nameParts = file.name.substring(6).split("-");
          if (nameParts.length >= 2) {
            parentId = nameParts[0] ?? "";
            id = nameParts[1]?.split(".")[0] ?? "";
          }

          return {
            id,
            parentId,
            mediaUrl,
            isParent: false,
            isVideo,
            isImage: !isVideo,
            fileName: file.name,
            uploadedAt: file.uploadedAt,
          };
        });

      return allPhotos.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    } catch (error) {
      console.error("Error fetching all instagram photos:", error);
      return [];
    }
  }),
});
