"use client";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import "react-inner-image-zoom/lib/styles.min.css";
import InnerImageZoom from "react-inner-image-zoom";
import type { InstaChild } from "./PhotoGrid";
import { useState } from "react";
import { motion } from "framer-motion";
import { useMobile } from "~/context/mobile-provider";

// Individual media item component to manage loading state
function MediaItem({
  file,
  index,
  isMobile,
}: {
  file: InstaChild;
  index: number;
  isMobile: boolean;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.li
      key={file.mediaUrl}
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="group relative row-span-2 overflow-hidden rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
        {file.isImage ? (
          <InnerImageZoom
            src={file.mediaUrl}
            className="relative aspect-[4/5] rounded-lg object-cover group-hover:opacity-75"
            zoomType="hover"
            hideHint={true}
          />
        ) : (
          <>
            {/* Loading skeleton for videos */}
            {isLoading && (
              <div className="absolute inset-0 animate-pulse rounded-lg bg-gradient-to-r from-emerald-900/20 via-emerald-800/30 to-emerald-900/20">
                <div className="flex aspect-[4/5] w-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400"></div>
                </div>
              </div>
            )}
            <MediaPlayer
              src={file.mediaUrl}
              aspectRatio="4/5"
              autoplay={!isMobile}
              muted={true}
              loop={true}
              className={`rounded-lg transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
              onLoadedData={() => {
                setIsLoading(false);
              }}
              onError={() => {
                setIsLoading(false);
              }}
            >
              <MediaProvider />
            </MediaPlayer>
          </>
        )}
      </div>
    </motion.li>
  );
}

export default function PhotoModalGrid(instaChildren: {
  instaChildren: InstaChild[];
}) {
  const { isMobile } = useMobile();

  const count = instaChildren.instaChildren.length;
  let gridCols = "";

  // Dynamic grid layout based on image count for better responsiveness
  if (count === 1) {
    gridCols = "grid-cols-1 max-w-md mx-auto";
  } else if (count === 2) {
    gridCols = "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto";
  } else if (count === 3) {
    gridCols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto";
  } else if (count === 4) {
    gridCols = "grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto";
  } else if (count === 5) {
    gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-5";
  } else if (count <= 6) {
    gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-6";
  } else if (count <= 8) {
    gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  } else {
    gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  }

  // Adjust gap spacing based on image count
  const gapClass =
    count <= 2
      ? "gap-4 sm:gap-6"
      : count <= 4
        ? "gap-3 sm:gap-4"
        : "gap-2 sm:gap-3";

  // Adjust padding based on image count for better space utilization
  const paddingClass =
    count <= 4 ? "px-4 sm:px-6 lg:px-8" : "px-2 sm:px-4 lg:px-6";

  return (
    <div className={`w-full ${paddingClass}`}>
      <ul role="list" className={`grid ${gridCols} ${gapClass}`}>
        {instaChildren.instaChildren.map((file, index) => (
          <MediaItem
            key={file.mediaUrl}
            file={file}
            index={index}
            isMobile={isMobile}
          />
        ))}
      </ul>
    </div>
  );
}
