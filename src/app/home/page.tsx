import { fetchChildrenIds } from "../api/instagram/fetchChildrenIds";
import { fetchChildrenMedia } from "../api/instagram/fetchChilldrenMedia";
import { fetchMedia } from "../api/instagram/fetchMedia";
import { fetchUserMedia } from "../api/instagram/fetchUserMedia";
import PhotoGrid, { InstaItem } from "./components/photoGrid";

export default async function Home() {
  

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

    return fetchedItems;
  }

  const instaItems = await doFetch();
  
  return (
    <>
      <main className= "-mt-32">
        <PhotoGrid photoGridProps={instaItems}/>
      </main>
    </>
  )
};