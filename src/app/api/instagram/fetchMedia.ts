'use server'

import type { InstaItem, InstagramMediaResponse } from '~/types/instagram';

const accessToken = process.env.NEXT_PUBLIC_INSTA_ACCESS_TOKEN;

export async function fetchMedia(id: string): Promise<InstaItem> {
  const mediaUrl = `https://graph.instagram.com/${id}?access_token=${accessToken}&fields=media_url,permalink,id`;

  const res = await fetch(mediaUrl);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch Instagram media: ${res.status}`);
  }
  
  const json = await res.json() as InstagramMediaResponse;

  const instaItem: InstaItem = {
    mediaUrl: json.media_url,
    parentId: json.id,
    children: []
  };
  
  return instaItem;
}