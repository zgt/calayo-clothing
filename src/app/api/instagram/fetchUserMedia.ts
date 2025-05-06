'use server'

import type { InstagramMediaItem } from '~/types/instagram';

const userId = process.env.NEXT_PUBLIC_INSTA_USER_ID;
const accessToken = process.env.NEXT_PUBLIC_INSTA_ACCESS_TOKEN;

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
  const res = await fetch(instaUrl);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch Instagram user media: ${res.status}`);
  }
  
  const json = await res.json() as UserMediaResponse;
  return json.data;
}