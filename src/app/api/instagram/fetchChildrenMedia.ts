"use server";

import type { InstaChild, InstagramMediaResponse } from "~/types/instagram";

const accessToken = process.env.INSTA_ACCESS_TOKEN;

interface ChildrenMedia {
  mediaId: string;
  children: Array<{ id: string }>;
}

export async function fetchChildrenMedia(
  children: ChildrenMedia,
): Promise<InstaChild[]> {
  const childrenInstaItems: InstaChild[] = [];
  // Filter out a specific item - might be a known problematic ID
  const filteredChildren = children.children.filter(
    (e) => e.id !== "18073671322666337",
  );

  for (const child of filteredChildren) {
    const id = child.id;
    const mediaUrl = `https://graph.instagram.com/${id}?access_token=${accessToken}&fields=media_url,permalink,media_type`;

    const res = await fetch(mediaUrl);

    if (!res.ok) {
      console.error(`Failed to fetch child media ${id}: ${res.status}`);
      continue; // Skip this item but continue with others
    }

    const json = (await res.json()) as InstagramMediaResponse & {
      media_type?: string;
    };

    // First try to use Instagram's media_type field
    let isImage = true;
    if (json.media_type) {
      isImage = json.media_type === "IMAGE";
    } else {
      // Fallback: Check the actual media content by fetching a small portion
      try {
        const mediaResponse = await fetch(json.media_url, {
          method: "HEAD", // Only get headers to check content-type
        });
        const contentType = mediaResponse.headers.get("content-type") ?? "";
        isImage = contentType.startsWith("image/");
      } catch (error) {
        console.error(`Failed to determine media type for ${id}:`, error);
        // Final fallback: assume it's an image
        isImage = true;
      }
    }

    const instaChild: InstaChild = {
      mediaUrl: json.media_url,
      parentId: children.mediaId,
      isImage: isImage,
    };

    childrenInstaItems.push(instaChild);
  }

  return childrenInstaItems;
}
