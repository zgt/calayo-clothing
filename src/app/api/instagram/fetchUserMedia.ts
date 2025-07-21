"use server";

import type { InstagramMediaItem } from "~/types/instagram";

const userId = process.env.INSTA_USER_ID;
const accessToken = process.env.INSTA_ACCESS_TOKEN;

const instaUrl = `https://graph.instagram.com/${userId}/media?access_token=${accessToken}&fields=media_url,permalink,id`;

interface UserMediaResponse {
  data: InstagramMediaItem[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export async function fetchUserMedia(): Promise<InstagramMediaItem[]> {
  // Validate required environment variables
  if (!userId) {
    throw new Error("INSTA_USER_ID environment variable is not set");
  }

  if (!accessToken) {
    throw new Error("INSTA_ACCESS_TOKEN environment variable is not set");
  }

  // Removed sensitive logging for security

  const res = await fetch(instaUrl);

  console.log("Instagram API response status:", res.status);
  console.log(
    "Instagram API response headers:",
    Object.fromEntries(res.headers.entries()),
  );

  if (!res.ok) {
    let errorDetails = "";
    try {
      const errorText = await res.text();
      console.error("Instagram API error response body:", errorText);
      errorDetails = ` - ${errorText}`;
    } catch (e) {
      console.error("Failed to read error response body:", e);
    }

    throw new Error(
      `Failed to fetch Instagram user media: ${res.status}${errorDetails}`,
    );
  }

  const json = (await res.json()) as UserMediaResponse;
  console.log(
    "Successfully fetched Instagram media:",
    json.data?.length || 0,
    "items",
  );
  return json.data;
}
