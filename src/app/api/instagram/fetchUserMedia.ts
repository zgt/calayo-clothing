'use server'
const userId = process.env.NEXT_PUBLIC_INSTA_USER_ID
const accessToken = process.env.NEXT_PUBLIC_INSTA_ACCES_TOKEN

const instaUrl = `https://graph.instagram.com/${userId}/media?access_token=${accessToken}`

export async function fetchUserMedia(){

    const res = await fetch(instaUrl)
    const json = (await res.json()).data;

    return json

}