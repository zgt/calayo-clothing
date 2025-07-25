"use server";

import type {
  InstagramChild,
  InstagramChildrenResponse,
} from "~/types/instagram";

const accessToken = process.env.INSTA_ACCESS_TOKEN;

interface ChildrenResult {
  mediaId: string;
  children: InstagramChild[];
}

export async function fetchChildrenIds(id: string): Promise<ChildrenResult> {
  const childrenURL = `https://graph.instagram.com/${id}/children?access_token=${accessToken}`;

  const res = await fetch(childrenURL);

  if (!res.ok) {
    throw new Error(`Failed to fetch Instagram children IDs: ${res.status}`);
  }

  const jsonResponse = (await res.json()) as InstagramChildrenResponse;

  const children: ChildrenResult = {
    mediaId: id,
    children: jsonResponse.data,
  };

  return children;
}
