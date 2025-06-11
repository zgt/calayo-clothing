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

// Type for media items from UploadThing
interface MediaItem {
  id: string;
  parentId: string;
  mediaUrl: string;
  permalink: string;
  isVideo: boolean;
  isParent: boolean;
  uploadedAt: string;
  name: string;
}

// Type for grouped media
interface GroupedMedia {
  parent: MediaItem | null;
  children: MediaItem[];
}

// In-memory storage for now (you might want to use a database later)
let storedPhotos: StoredPhoto[] = [];

export const instagramRouter = createTRPCRouter({
  // Get all stored photos for display - now fetches directly from UploadThing
  getStoredPhotos: publicProcedure.query(async () => {
    try {
      // Get all files from UploadThing
      const listFilesResponse = await utapi.listFiles();

      if (!listFilesResponse?.files) {
        throw new Error("Invalid response from UploadThing listFiles");
      }

      const { files } = listFilesResponse;

      // Filter for image and video files
      const mediaFiles = files.filter((file) => {
        const fileName = file.name.toLowerCase();
        console.log(fileName);
        const isImage =
          fileName.endsWith(".jpg") ||
          fileName.endsWith(".jpeg") ||
          fileName.endsWith(".png") ||
          fileName.endsWith(".webp");
        const isVideo =
          fileName.endsWith(".mp4") ||
          fileName.endsWith(".mov") ||
          fileName.endsWith(".webm");
        return (isImage || isVideo) && file.status === "Uploaded";
      });

      if (mediaFiles.length === 0) {
        return [];
      }

      // Get URLs for all media files
      const mediaUrls = await utapi.getFileUrls(
        mediaFiles.map((file) => file.key),
      );

      if (!mediaUrls?.data) {
        throw new Error("Invalid response from UploadThing getFileUrls");
      }

      // Map the files to our format
      const mediaItems: MediaItem[] = mediaFiles.map((file, index) => {
        if (!mediaUrls.data[index]?.url) {
          throw new Error(`Missing URL for file ${file.key}`);
        }

        const fileName = file.name.toLowerCase();
        const isVideo =
          fileName.endsWith(".mp4") ||
          fileName.endsWith(".mov") ||
          fileName.endsWith(".webm");

        // Parse parent ID from filename
        // Format: parent-[id].jpg or child-[parent-id]-[timestamp].jpg
        let parentId: string;
        let isParent: boolean;

        if (file.name.startsWith('parent-')) {
          // Extract ID from parent-[id].jpg
          parentId = file.name.split('-')[1]?.split('.')[0] ?? file.key;
          isParent = true;
        } else if (file.name.startsWith('child-')) {
          // Extract parent ID from child-[parent-id]-[timestamp].jpg
          parentId = file.name.split('-')[1] ?? file.key;
          isParent = false;
        } else {
          // Fallback for files that don't match the expected format
          parentId = file.key;
          isParent = true;
        }

        return {
          id: file.key,
          parentId,
          mediaUrl: mediaUrls.data[index].url,
          permalink: `#${file.key}`,
          isVideo,
          isParent,
          uploadedAt: new Date(file.uploadedAt).toISOString(),
          name: file.name,
        };
      });

      // Group media by parentId to create parent/child structure
      const groupedMedia = mediaItems.reduce(
        (acc, item) => {
          const parentId = item.parentId;
          acc[parentId] ??= {
            parent: null,
            children: [],
          };

          if (item.isParent) {
            // This is a parent image
            acc[parentId].parent = item;
          } else {
            // This is a child image
            acc[parentId].children.push(item);
          }

          return acc;
        },
        {} as Record<string, GroupedMedia>,
      );

      // Convert grouped media to the expected format
      return Object.values(groupedMedia)
        .filter((group): group is GroupedMedia & { parent: MediaItem } => 
          group.parent !== null
        )
        .map((group) => ({
          permalink: group.parent.permalink,
          mediaUrl: group.parent.mediaUrl,
          parentId: group.parent.parentId,
          children: group.children.map((child) => ({
            mediaUrl: child.mediaUrl,
            parentId: group.parent.parentId, // Use the parent's ID for consistency
            isImage: !child.isVideo,
          })),
        }));
    } catch (error) {
      console.error("Error fetching media from UploadThing:", error);
      // Fallback to in-memory storage if UploadThing fails
      const parentPhotos = storedPhotos.filter((photo) => photo.isParent);

      return parentPhotos.map((parent) => {
        const children = storedPhotos
          .filter((photo) => photo.customId === parent.id)
          .map((child) => ({
            mediaUrl: child.uploadthingUrl,
            parentId: parent.id,
            isImage: true,
          }));

        return {
          permalink: `https://instagram.com/p/${parent.id}`,
          mediaUrl: parent.uploadthingUrl,
          parentId: parent.id,
          children,
        };
      });
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

            // Convert blob to File for UploadThing
            const parentFile = new File([parentBlob], `parent-${item.id}.jpg`, {
              type: parentBlob.type || "image/jpeg",
            });

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

                  // Convert blob to File for UploadThing
                  const childFile = new File(
                    [childBlob],
                    `child-${item.id}-${Date.now()}.jpg`,
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
