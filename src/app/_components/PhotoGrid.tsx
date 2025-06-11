"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Modal, Backdrop, Fade, Box } from "@mui/material";
import LoadingAnimation from "./LoadingAnimation";
import PhotoModalGrid from "./PhotoModalGrid";
import { api } from "~/trpc/react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "90%",
    sm: "80%",
    md: "70%",
    lg: "60%",
    xl: "50%",
  },
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "bg-gradient-to-br from-emerald-900/30 to-emerald-950/80",
  border: "2px solid #000",
  boxShadow: 24,
  p: { xs: 2, sm: 3, md: 4 },
  display: "block",
};

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
  const [isOpen, setIsOpen] = useState("");
  const handleClose = () => setIsOpen("");

  // Use tRPC to fetch stored photos from UploadThing
  const {
    data: fetchedItems,
    isLoading,
    error,
  } = api.instagram.getStoredPhotos.useQuery();

  console.log(fetchedItems);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-screen w-full"
    >
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-950 to-gray-950"></div>

      {/* Responsive container */}
      <div className="mx-auto -mt-40 w-[95%] px-2 py-4 sm:-mt-60 sm:w-[85%] sm:px-4 sm:py-8 md:-mt-80 md:w-[75%] lg:w-[80%]">
        {isLoading ? (
          <LoadingAnimation />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border border-red-700/20 bg-gradient-to-br from-red-900/30 to-red-950/80 p-6 text-center shadow-xl backdrop-blur-sm"
          >
            <p className="text-lg text-red-200">Failed to load photos</p>
            <p className="mt-2 text-sm text-red-300">
              Please try refreshing the page or contact admin
            </p>
          </motion.div>
        ) : !fetchedItems || fetchedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-6 text-center shadow-xl backdrop-blur-sm"
          >
            <p className="text-lg text-emerald-200">No photos available</p>
            <p className="mt-2 text-sm text-emerald-300">
              Photos need to be synced from Instagram by an admin
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-2 shadow-xl backdrop-blur-sm sm:p-4 md:p-6"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
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
                      setIsOpen(item.parentId);
                    }}
                  >
                    <div className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md ring-1 shadow-emerald-950/50 ring-emerald-700/30 transition-all hover:shadow-lg hover:shadow-emerald-900/30 hover:ring-emerald-500/40">
                      <div className="aspect-[4/5] w-full overflow-hidden">
                        <div className="relative h-full w-full">
                          <Image
                            src={item.mediaUrl}
                            alt="Gallery image"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                        {/* View overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="rounded-full bg-emerald-600/80 p-2 backdrop-blur-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Media type indicator */}
                      {item.children && item.children.length > 1 && (
                        <div className="absolute top-2 right-2 rounded-md bg-emerald-700/80 px-1.5 py-0.5 backdrop-blur-sm">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                              <path d="M6 7h8v2H6V7zm0 4h8v2H6v-2z" />
                            </svg>
                            <span className="ml-0.5 text-xs font-medium text-white">
                              {item.children.length}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                  <div>
                    <Modal
                      aria-labelledby="transition-modal-title"
                      aria-describedby="transition-modal-description"
                      open={isOpen == item.parentId}
                      onClose={handleClose}
                      closeAfterTransition
                      slots={{ backdrop: Backdrop }}
                      slotProps={{
                        backdrop: {
                          timeout: 500,
                        },
                      }}
                    >
                      <Fade in={isOpen == item.parentId}>
                        <Box
                          sx={style}
                          className="rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm"
                        >
                          <PhotoModalGrid instaChildren={item.children} />
                        </Box>
                      </Fade>
                    </Modal>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
}
