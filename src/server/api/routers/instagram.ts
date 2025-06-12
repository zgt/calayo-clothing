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
    try {
      // Fetch Instagram media
      const instagramMedia = await fetchUserMedia();

      const uploadPromises = instagramMedia
        .filter((item) => item?.id)
        .slice(0, 10) // Limit to first 10 for testing
        .map(async (item) => {
          try {
            // Fetch parent photo
            const parentResponse = await fetch(item.media_url);
            if (!parentResponse.ok) {
              throw new Error(
                `Failed to fetch parent image: ${parentResponse.status}`,
              );
            }
            const parentBlob = await parentResponse.blob();

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
            const parentUpload = await utapi.uploadFiles(parentFile);

            if (!parentUpload.data) {
              throw new Error("Failed to upload parent photo");
            }

            // Store parent photo info
            const parentPhoto: StoredPhoto = {
              id: item.id,
              parentId: item.id,
              uploadthingUrl: parentUpload.data.url,
              originalUrl: item.media_url,
              isParent: true,
              createdAt: new Date(),
            };

            // Fetch and upload children
            const childPhotos: StoredPhoto[] = [];
            try {
              const childrenIds = await fetchChildrenIds(item.id);
              const childrenMedia = await fetchChildrenMedia(childrenIds);

              for (const child of childrenMedia) {
                try {
                  const childResponse = await fetch(child.mediaUrl);
                  if (!childResponse.ok) continue;

                  const childBlob = await childResponse.blob();

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
                  const childUpload = await utapi.uploadFiles(childFile);

                  if (childUpload.data) {
                    childPhotos.push({
                      id: `${item.id}-${Date.now()}-${Math.random()}`,
                      parentId: item.id,
                      uploadthingUrl: childUpload.data.url,
                      originalUrl: child.mediaUrl,
                      isParent: false,
                      customId: item.id,
                      createdAt: new Date(),
                    });
                  }
                } catch (error) {
                  console.error(`Error processing child photo:`, error);
                }
              }
            } catch (error) {
              console.error(`Error fetching children for ${item.id}:`, error);
            }

            return {
              parent: parentPhoto,
              children: childPhotos,
            };
          } catch (error) {
            console.error(`Error processing item ${item.id}:`, error);
            return null;
          }
        });

      const results = await Promise.all(uploadPromises);
      const validResults = results.filter(Boolean);

      // Store all photos
      storedPhotos = [];
      validResults.forEach((result) => {
        if (result) {
          storedPhotos.push(result.parent);
          storedPhotos.push(...result.children);
        }
      });

      return {
        success: true,
        totalPhotos: storedPhotos.length,
        parentPhotos: storedPhotos.filter((p) => p.isParent).length,
        childPhotos: storedPhotos.filter((p) => !p.isParent).length,
      };
    } catch (error) {
      console.error("Error syncing Instagram photos:", error);
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
});
