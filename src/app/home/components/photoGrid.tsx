'use client'
import { useEffect, useState } from "react";
import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import PhotoModalGrid from "./photoModalGrid"



const userId = process.env.NEXT_PUBLIC_INSTA_USER_ID
const accessToken = process.env.NEXT_PUBLIC_INSTA_ACCES_TOKEN

const instaUrl = `https://graph.instagram.com/${userId}/media?access_token=${accessToken}`

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

        const fetchMedia = async (id: string) => {
            const mediaUrl = `https://graph.instagram.com/${id}?access_token=${accessToken}&fields=media_url,permalink`

            const res = await fetch(mediaUrl);
            const json = (await res.json());

            const instaItem: InstaItem = {
                permalink: json.permalink,
                mediaUrl: json.media_url,
                parentId: json.id,
                children: []
            }
            return instaItem
        }

        const fetchChildrenIds = async (id: string) => {
          const childrenURL = `https://graph.instagram.com/${id}/children?access_token=${accessToken}`

          const res = await fetch(childrenURL);
          const json = (await res.json()).data;


          const children = {
            mediaId: id,
            children: json
          }

          return children

        }

        const fetchChildrenMedia = async (children: { mediaId: string; children: Array<{id:string}>; }) => {
          const childrenInstaItems : InstaChild[] = [];
          //const test = children.children[7].id
          //console.log(test)
          const filteredChildren = children.children.filter( (e) => e.id !== "18073671322666337")

          for(let i = 0; i<filteredChildren.length; i++){

            const id = filteredChildren[i].id;
            const mediaUrl = `https://graph.instagram.com/${id}?access_token=${accessToken}&fields=media_url,permalink`

            const res = await fetch(mediaUrl);
            const json = (await res.json());
            const image = json.media_url.includes('jpg');
            
            const instaChild: InstaChild = {
              mediaUrl: json.media_url,
              parentId: children.mediaId,
              isImage: image
            }
            childrenInstaItems.push(instaChild)
          }


          return childrenInstaItems
        }

        const doFetch = async() =>{
            const res = await fetch(instaUrl)
            const json = (await res.json()).data;


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