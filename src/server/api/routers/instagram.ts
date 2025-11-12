import {
  createTRPCRouter,
  adminProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { fetchUserMedia } from "~/app/api/instagram/fetchUserMedia";
import { fetchChildrenIds } from "~/app/api/instagram/fetchChildrenIds";
import { fetchChildrenMedia } from "~/app/api/instagram/fetchChildrenMedia";
import { utapi } from "~/server/uploadthing";

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
  syncInstagramPhotos: adminProcedure.mutation(async ({ ctx }) => {
    console.warn("Starting Instagram photo sync process");

    try {
      // Fetch existing media from database (much faster than querying UploadThing)
      console.warn("Fetching existing synced media from database");
      const { data: existingMedia, error } = await ctx.supabase
        .from("instagram_media")
        .select("instagram_media_id, is_parent, parent_instagram_id");

      if (error) {
        console.error("Error fetching existing media:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Create sets of existing parent and child IDs for quick lookup
      const existingParentIds = new Set<string>();
      const existingChildParentIds = new Set<string>();

      (existingMedia ?? []).forEach(
        (media: {
          instagram_media_id: string;
          is_parent: boolean;
          parent_instagram_id: string | null;
        }) => {
          if (media.is_parent) {
            existingParentIds.add(media.instagram_media_id);
          } else if (media.parent_instagram_id) {
            existingChildParentIds.add(media.parent_instagram_id);
          }
        },
      );

      console.warn(
        `Found ${existingParentIds.size} existing parent photos and ${existingChildParentIds.size} parent IDs with children`,
      );

      // Fetch Instagram media
      console.warn("Fetching Instagram media from API");
      let instagramMedia;
      try {
        instagramMedia = await fetchUserMedia();
        console.warn(
          `Successfully fetched ${instagramMedia.length} Instagram media items`,
        );
      } catch (error) {
        console.error("Failed to fetch Instagram media:", error);
        console.error(
          "Instagram API error details:",
          error instanceof Error ? error.message : String(error),
        );
        throw new Error(
          `Failed to fetch Instagram media: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      // Filter out items that already exist
      const newInstagramMedia = instagramMedia.filter((item) => {
        if (!item?.id) return false;
        return !existingParentIds.has(item.id);
      });

      console.warn(
        `Found ${instagramMedia.length} Instagram photos, ${existingParentIds.size} already exist, uploading ${newInstagramMedia.length} new photos`,
      );

      const uploadPromises = newInstagramMedia.map(async (item) => {
        console.warn(`Processing Instagram media item: ${item.id}`);
        try {
          // Fetch parent photo
          console.warn(
            `Fetching parent photo for item ${item.id} from: ${item.media_url}`,
          );
          const parentResponse = await fetch(item.media_url);
          if (!parentResponse.ok) {
            console.error(
              `Failed to fetch parent image for ${item.id}: HTTP ${parentResponse.status} - ${parentResponse.statusText}`,
            );
            throw new Error(
              `Failed to fetch parent image: ${parentResponse.status}`,
            );
          }
          const parentBlob = await parentResponse.blob();
          console.warn(
            `Successfully fetched parent photo for ${item.id}, size: ${parentBlob.size} bytes, type: ${parentBlob.type}`,
          );

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
          console.warn(`Uploading parent photo for ${item.id} to UploadThing`);
          let parentUpload;
          try {
            parentUpload = await utapi.uploadFiles(parentFile);
          } catch (error) {
            console.error(
              `Failed to upload parent photo for ${item.id} to UploadThing:`,
              error,
            );
            console.error(
              `Upload error details:`,
              error instanceof Error ? error.message : String(error),
            );
            throw new Error(
              `Failed to upload parent photo: ${error instanceof Error ? error.message : "Upload failed"}`,
            );
          }

          if (!parentUpload.data) {
            console.error(
              `Failed to upload parent photo for ${item.id}: Upload returned no data`,
            );
            console.error(`Upload response:`, parentUpload);
            throw new Error("Failed to upload parent photo");
          }

          console.warn(
            `Successfully uploaded parent photo for ${item.id} to: ${parentUpload.data.ufsUrl}`,
          );

          // Determine media type from MIME type
          const parentMediaType = parentMimeType.startsWith("video/")
            ? "VIDEO"
            : "IMAGE";

          // Save parent photo to database
          const { error: insertError } = await ctx.supabase
            .from("instagram_media")
            .insert({
              instagram_media_id: item.id,
              instagram_permalink: item.permalink ?? null,
              media_type: parentMediaType,
              is_parent: true,
              parent_instagram_id: null,
              uploadthing_file_key: parentUpload.data.key,
              uploadthing_url: parentUpload.data.ufsUrl,
              file_size_bytes: parentBlob.size,
            });

          if (insertError) {
            console.error(
              `Error saving parent photo ${item.id} to database:`,
              insertError,
            );
          } else {
            console.warn(`Saved parent photo ${item.id} to database`);
          }

          // Fetch and upload children (only if parent doesn't already have children uploaded)
          let childrenUploaded = 0;
          try {
            // Skip children if this parent already has children uploaded
            if (!existingChildParentIds.has(item.id)) {
              console.warn(`Fetching children for parent ${item.id}`);
              const childrenIds = await fetchChildrenIds(item.id);
              console.warn(
                `Found ${childrenIds.children.length} children IDs for parent ${item.id}`,
              );

              const childrenMedia = await fetchChildrenMedia(childrenIds);
              console.warn(
                `Successfully fetched ${childrenMedia.length} children media items for parent ${item.id}`,
              );

              for (const child of childrenMedia) {
                try {
                  console.warn(
                    `Processing child media from URL: ${child.mediaUrl}`,
                  );
                  const childResponse = await fetch(child.mediaUrl);
                  if (!childResponse.ok) {
                    console.error(
                      `Failed to fetch child media: HTTP ${childResponse.status} - ${childResponse.statusText}`,
                    );
                    continue;
                  }

                  const childBlob = await childResponse.blob();
                  console.warn(
                    `Successfully fetched child media, size: ${childBlob.size} bytes, type: ${childBlob.type}`,
                  );

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
                  console.warn(`Uploading child photo to UploadThing`);
                  let childUpload;
                  try {
                    childUpload = await utapi.uploadFiles(childFile);
                  } catch (error) {
                    console.error(
                      `Failed to upload child photo to UploadThing:`,
                      error,
                    );
                    console.error(
                      `Child upload error details:`,
                      error instanceof Error ? error.message : String(error),
                    );
                    continue; // Skip this child and continue with the next one
                  }

                  if (childUpload.data) {
                    console.warn(
                      `Successfully uploaded child photo to: ${childUpload.data.ufsUrl}`,
                    );

                    // Determine child media type from MIME type
                    const childMediaType = mimeType.startsWith("video/")
                      ? "VIDEO"
                      : "IMAGE";

                    // Save child photo to database
                    const { error: childInsertError } = await ctx.supabase
                      .from("instagram_media")
                      .insert({
                        instagram_media_id: `${item.id}-child-${Date.now()}-${Math.random()}`,
                        instagram_permalink: null,
                        media_type: childMediaType,
                        is_parent: false,
                        parent_instagram_id: item.id,
                        uploadthing_file_key: childUpload.data.key,
                        uploadthing_url: childUpload.data.ufsUrl,
                        file_size_bytes: childBlob.size,
                      });

                    if (childInsertError) {
                      console.error(
                        "Error saving child photo to database:",
                        childInsertError,
                      );
                    } else {
                      childrenUploaded++;
                      console.warn(
                        `Saved child photo to database (${childrenUploaded} children total)`,
                      );
                    }
                  } else {
                    console.error(
                      `Failed to upload child photo: Upload returned no data`,
                    );
                    console.error(`Child upload response:`, childUpload);
                  }
                } catch (error) {
                  console.error(
                    `Error processing child photo for parent ${item.id}:`,
                    error,
                  );
                  console.error(`Child media URL: ${child.mediaUrl}`);
                  console.error(
                    `Error details:`,
                    error instanceof Error ? error.message : String(error),
                  );
                }
              }
            } else {
              console.warn(`Skipping children for ${item.id} - already exist`);
            }
          } catch (error) {
            console.error(`Error fetching children for ${item.id}:`, error);
            console.error(
              `Children fetch error details:`,
              error instanceof Error ? error.message : String(error),
            );
          }

          console.warn(
            `Completed processing item ${item.id}: 1 parent, ${childrenUploaded} children`,
          );
          return {
            parentId: item.id,
            childrenCount: childrenUploaded,
          };
        } catch (error) {
          console.error(`Error processing item ${item.id}:`, error);
          console.error(
            `Item processing error details:`,
            error instanceof Error ? error.message : String(error),
          );
          console.error(`Item media URL: ${item.media_url}`);
          return null;
        }
      });

      console.warn("Waiting for all upload promises to complete");
      const results = await Promise.all(uploadPromises);
      const validResults = results.filter(Boolean);
      const failedResults = results.length - validResults.length;

      console.warn(
        `Upload results: ${validResults.length} successful, ${failedResults} failed`,
      );

      // Calculate total children uploaded
      const totalChildrenUploaded = validResults.reduce(
        (sum, result) => sum + (result?.childrenCount ?? 0),
        0,
      );

      const finalStats = {
        success: true,
        newParentsUploaded: validResults.length,
        newChildrenUploaded: totalChildrenUploaded,
        totalNewPhotos: validResults.length + totalChildrenUploaded,
        totalInstagramPhotos: instagramMedia.length,
        existingPhotos: existingParentIds.size,
        failedUploads: failedResults,
        skippedPhotos: instagramMedia.length - newInstagramMedia.length,
      };

      console.warn("Instagram photo sync completed successfully:", finalStats);
      return finalStats;
    } catch (error) {
      console.error("Error syncing Instagram photos:", error);
      console.error(
        "Sync error details:",
        error instanceof Error ? error.message : String(error),
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );

      throw new Error(
        `Failed to sync Instagram photos: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }),

  // Get sync status from database
  getSyncStatus: adminProcedure.query(async ({ ctx }) => {
    // Get total count
    const { count: totalCount } = await ctx.supabase
      .from("instagram_media")
      .select("*", { count: "exact", head: true });

    // Get parent count
    const { count: parentCount } = await ctx.supabase
      .from("instagram_media")
      .select("*", { count: "exact", head: true })
      .eq("is_parent", true);

    // Get child count
    const { count: childCount } = await ctx.supabase
      .from("instagram_media")
      .select("*", { count: "exact", head: true })
      .eq("is_parent", false);

    // Get last sync time
    const { data: lastSyncData } = await ctx.supabase
      .from("instagram_media")
      .select("synced_at")
      .order("synced_at", { ascending: false })
      .limit(1)
      .single();

    return {
      totalPhotos: totalCount ?? 0,
      parentPhotos: parentCount ?? 0,
      childPhotos: childCount ?? 0,
      lastSyncTime: lastSyncData?.synced_at
        ? new Date(lastSyncData.synced_at as string).getTime()
        : null,
    };
  }),

  // Get all instagram photos from database in a single array
  getAllInstagramPhotos: publicProcedure.query(async ({ ctx }) => {
    try {
      const { data: instagramMedia, error } = await ctx.supabase
        .from("instagram_media")
        .select(
          "id, instagram_media_id, parent_instagram_id, uploadthing_url, uploadthing_file_key, synced_at, media_type",
        )
        .eq("is_parent", false)
        .eq("media_type", "IMAGE")
        .order("synced_at", { ascending: false });

      if (error) {
        console.error("Error fetching instagram photos from database:", error);
        return [];
      }

      if (!instagramMedia || instagramMedia.length === 0) {
        return [];
      }

      const allPhotos = instagramMedia.map((media) => {
        return {
          id: media.instagram_media_id as string,
          parentId: (media.parent_instagram_id as string | null) ?? "",
          mediaUrl: (media.uploadthing_url as string | null) ?? "",
          isParent: false,
          isVideo: false,
          isImage: true,
          fileName: (media.uploadthing_file_key as string | null) ?? "",
          uploadedAt: new Date(
            (media.synced_at as string | null) ?? new Date(),
          ),
        };
      });

      return allPhotos;
    } catch (error) {
      console.error("Error fetching all instagram photos:", error);
      return [];
    }
  }),
});
