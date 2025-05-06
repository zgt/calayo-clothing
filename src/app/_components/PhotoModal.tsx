"use client";

import React, { useState } from 'react';
import Image from 'next/image';

export interface InstaChild {
  mediaUrl: string;
  parentId: string;
  isImage: boolean;
  caption?: string;
}

interface PhotoModalProps {
  instaChildren: InstaChild[];
  title: string;
  onClose: () => void;
}

export default function PhotoModal({ instaChildren, title, onClose }: PhotoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? instaChildren.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === instaChildren.length - 1 ? 0 : prev + 1));
  };

  const currentChild = instaChildren[currentIndex];
  if (!currentChild) {
    return null;
  }

  return (
    <div className="relative w-full h-full bg-black/90">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="relative h-full flex items-center justify-center">
        {currentChild.isImage ? (
          <div className="relative w-full h-full">
            <Image
              src={currentChild.mediaUrl}
              alt={currentChild.caption ?? title}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <video
            src={currentChild.mediaUrl}
            controls
            className="max-h-[90vh] max-w-[90vw]"
          />
        )}
      </div>

      {instaChildren.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}