"use client"
import { Button } from "@headlessui/react"
import { useRouter } from 'next/navigation'


interface ProfileButtonProps {
    profileButtonProps: {
        name:string,
        href:string
    };
}
 
export default function ProfileButton({profileButtonProps}:ProfileButtonProps) {
    console.log(profileButtonProps)
    const router = useRouter()
    
  return <Button 
            className=" block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
            onClick={() => router.push(profileButtonProps.href)}
            >
            {profileButtonProps.name}
        </Button>
}
