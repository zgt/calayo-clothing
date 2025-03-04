"use client"
import { Button } from "@headlessui/react"
import { signIn } from "next-auth/react"
 
export default function SignIn() {
  return <Button 
            className="bg-green-950 text-white rounded-md px-3 py-2 text-sm font-medium"
            onClick={() => signIn("google")}>
            Sign in
        </Button>
}
