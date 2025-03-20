"use client"
import { Button } from "@headlessui/react"
import { signOut } from "next-auth/react"
 
export default function SignOut() {
  return <Button 
            className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
            onClick={() => signOut()}>
            Sign out
        </Button>
}
