'use client'
import { useEffect, useState } from "react";
import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import PhotoModalGrid from "./photoModalGrid"
import { fetchUserMedia } from "@/app/api/instagram/fetchUserMedia";
import { fetchMedia } from "@/app/api/instagram/fetchMedia";
import { fetchChildrenIds } from "@/app/api/instagram/fetchChildrenIds";
import { fetchChildrenMedia } from "@/app/api/instagram/fetchChilldrenMedia";


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  height: '65%',
  bgcolor: 'bg-[#003a2d]',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};



export interface InstaItem {
    permalink: string;
    mediaUrl: string;
    parentId: string;
    children: InstaChild[];
}

export interface InstaChild {
    mediaUrl: string;
    parentId: string;
    isImage: boolean;
}


export default function PhotoGrid() {

    const [instaItems, setInstaItems] = useState<InstaItem[]>([]);
    const [isOpen, setIsOpen] = useState("")
    const handleClose = () => setIsOpen("");
    const handleOpen = (id: string) => setIsOpen(id);
    useEffect(()=>{

        const doFetch = async() =>{
            const json = await fetchUserMedia();
            const fetchedItems: InstaItem[] = [];

            for(let i = 0; i<json.length; i++){
                const item = json[i];
                const itemId = item.id;
                const instaItem = await(fetchMedia(itemId))
                const childrenIds = await(fetchChildrenIds(itemId))
                const childrenMedia = await(fetchChildrenMedia(childrenIds))
        
                instaItem.children = childrenMedia
                fetchedItems.push(instaItem)
            }

            setInstaItems(fetchedItems)
        }

        doFetch()
    }, [])
    return (
        <main className="-mt-32">
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-[#003a2d] px-5 py-6 shadow sm:px-6">{
              <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:col-start-auto sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
              {instaItems.map((file) => (
              <li key={file.mediaUrl}  className="relative">
              <div onClick={()=>handleOpen(file.parentId)} className="group bg-[#003a2d] lg:grid-cols-4 overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                <img
                  alt=""
                  src={file.mediaUrl}
                  className="relative pointer-events-none aspect-[4/5] object-cover group-hover:opacity-75 "
                />
              </div>
              <div>
                <Modal
                  aria-labelledby="transition-modal-title"
                  aria-describedby="transition-modal-description"
                  open={isOpen == file.parentId}
                  onClose={handleClose}
                  closeAfterTransition
                  slots={{ backdrop: Backdrop }}
                  slotProps={{
                    backdrop: {
                      timeout: 500,
                    },
                  }}
                >
                  <Fade in={isOpen == file.parentId}>
                    <Box sx={style} className="rounded-lg bg-[#003a2d]">
                      <PhotoModalGrid instaChildren = {file.children}/>
                    </Box>
                  </Fade>
                </Modal>
              </div>
              </li>
              ))}
              </ul>}
            </div>
          </div>
        </main>
    )
}