'use server'

import type { InstaChild, InstagramMediaResponse } from '~/types/instagram';

const accessToken = process.env.NEXT_PUBLIC_INSTA_ACCESS_TOKEN;

interface ChildrenMedia {
  mediaId: string;
  children: Array<{ id: string }>;
}

export async function fetchChildrenMedia(children: ChildrenMedia): Promise<InstaChild[]> {
  const childrenInstaItems: InstaChild[] = [];
  // Filter out a specific item - might be a known problematic ID
  const filteredChildren = children.children.filter((e) => e.id !== "18073671322666337");

  for (const child of filteredChildren) {
    const id = child.id;
    const mediaUrl = `https://graph.instagram.com/${id}?access_token=${accessToken}&fields=media_url,permalink`;

    const res = await fetch(mediaUrl);
    
    if (!res.ok) {
      console.error(`Failed to fetch child media ${id}: ${res.status}`);
      continue; // Skip this item but continue with others
    }
    
    const json = await res.json() as InstagramMediaResponse;
    const image = json.media_url.includes('jpg');
    
    const instaChild: InstaChild = {
      mediaUrl: json.media_url,
      parentId: children.mediaId,
      isImage: image
    };
    
    childrenInstaItems.push(instaChild);
  }

  return childrenInstaItems;
}