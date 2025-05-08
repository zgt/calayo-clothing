'use client'
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import 'react-inner-image-zoom/lib/styles.min.css';
import InnerImageZoom from 'react-inner-image-zoom'
import type { InstaChild } from "./PhotoGrid";


export default function PhotoModalGrid(instaChildren: {instaChildren:InstaChild[]}) {
    //const [children, setChildren] = useState(instaChildren.instaChildren);


    return (
        <ul role="list" className="grid grid-cols-4 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-4 lg:grid-cols-4 xl:gap-x-6">
          {instaChildren.instaChildren.map((file) => (
            <li key={file.mediaUrl} className="relative">
              <div className="group overflow-hidden row-span-2 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                {file.isImage ? (
                    <InnerImageZoom
                    src={file.mediaUrl}
                    className="relative aspect-[4/5] object-cover group-hover:opacity-75"
                    zoomType="hover"
                    hideHint={true}
                  />
                ) : (
                    <MediaPlayer src={file.mediaUrl} aspectRatio="4/5" autoplay={true} muted={true} loop={true}>
                        <MediaProvider />
                    </MediaPlayer>
                    
                )}
              </div>
            </li>
          ))}
        </ul>
      )
}