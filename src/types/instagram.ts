// src/types/instagram.ts
// Type-only exports


// Base Instagram data type
export interface InstagramData {
    id: string;
    media_url: string;
    permalink: string;
  }
  
  // Instagram media item from user media
  export interface InstagramMediaItem extends InstagramData {
    // Additional fields can be added based on Instagram Graph API responses
    media_url: string;
    permalink: string;
  }
  
  // Instagram children response
  export interface InstagramChildrenResponse {
    data: InstagramChild[];
  }
  
  // Instagram child media item
  export interface InstagramChild extends InstagramData {
    // Instagram returns just the ID for children endpoints
    media_url: string;
    permalink: string;
  }
  
  // Instagram media response - for single media items
  export interface InstagramMediaResponse {
    id: string;
    media_url: string;
    permalink: string;
    // Add other fields as needed
  }
  
  // Types for your application components
  export interface InstaItem {
    mediaUrl: string;
    parentId: string;
    children: InstaChild[];
  }
  
  export interface InstaChild {
    mediaUrl: string;
    parentId: string;
    isImage: boolean;
  }