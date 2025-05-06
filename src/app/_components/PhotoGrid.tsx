"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import PhotoModal from "./PhotoModal";
import LoadingAnimation from "./LoadingAnimation";
import { Dialog, DialogContent } from "@mui/material";
import { fetchUserMedia } from "../api/instagram/fetchUserMedia";
import { fetchMedia } from "../api/instagram/fetchMedia";
import { fetchChildrenIds } from "../api/instagram/fetchChildrenIds";
import { fetchChildrenMedia } from "../api/instagram/fetchChildrenMedia";
  
export interface InstaItem {
  permalink: string;
  mediaUrl: string;
  parentId: string;
  children: InstaChild[];
  caption?: string;
}

export interface InstaChild {
  mediaUrl: string;
  parentId: string;
  isImage: boolean;
  caption?: string;
}

export default function PhotoGrid() {
  const [fetchedItems, setFetchedItems] = useState<InstaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InstaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadInstaItems() {
      try {
        const json = await fetchUserMedia();
        const items: InstaItem[] = [];
        
        for (const item of json) {
          if (!item?.id) continue;
          const itemId = item.id;
          const instaItem: InstaItem = {
            permalink: item.permalink,
            mediaUrl: item.media_url,
            parentId: item.id,
            children: [],
          };
          const childrenIds = await fetchChildrenIds(itemId);
          const childrenMedia = await fetchChildrenMedia(childrenIds);

          instaItem.children = childrenMedia;
          items.push(instaItem);
        }

        setFetchedItems(items);
        
        // Simulate loading time if needed
        setTimeout(() => setIsLoading(false), 500);
      } catch (error) {
        console.error("Error fetching Instagram data:", error);
        setIsLoading(false);
      }
    }

    void loadInstaItems();
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 to-gray-950 -z-10"></div>
      
      {/* 70% width container with centering */}
      <div className="w-[70%] -mt-80 mx-auto px-4 py-8">
        
        {isLoading ? (
          <LoadingAnimation />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-4 sm:p-6 shadow-xl border border-emerald-700/20"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {fetchedItems.map((item, index) => (
                <motion.div
                  key={item.parentId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <button 
                    className="w-full text-left" 
                    onClick={() => {
                      setSelectedItem(item);
                      setIsOpen(true);
                    }}
                  >
                    <div className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md shadow-emerald-950/50 ring-1 ring-emerald-700/30 transition-all hover:shadow-lg hover:shadow-emerald-900/30 hover:ring-emerald-500/40">
                      <div className="aspect-[4/5] w-full overflow-hidden">
                        <div className="relative h-full w-full">
                          <Image
                            src={item.mediaUrl}
                            alt={item.caption ?? "Gallery image"}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* View overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="rounded-full bg-emerald-600/80 p-2 backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Media type indicator */}
                      {item.children && item.children.length > 1 && (
                        <div className="absolute top-2 right-2 bg-emerald-700/80 rounded-md px-1.5 py-0.5 backdrop-blur-sm">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" clipRule="evenodd" />
                              <path d="M6 7h8v2H6V7zm0 4h8v2H6v-2z" />
                            </svg>
                            <span className="ml-0.5 text-xs font-medium text-white">{item.children.length}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* MUI Dialog */}
      <Dialog 
        open={isOpen} 
        onClose={() => setIsOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
            maxWidth: '90vw',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogContent 
          sx={{ 
            padding: 0, 
            overflow: 'hidden',
            backgroundColor: 'transparent',
            '&:first-of-type': { paddingTop: 0 }
          }}
        >
          {selectedItem && (
            <PhotoModal 
              instaChildren={selectedItem.children ?? []} 
              title={selectedItem.caption ?? "Photo Gallery"}
              onClose={() => {
                setSelectedItem(null);
                setIsOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.main>
  );
}