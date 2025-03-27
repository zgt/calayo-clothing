import { Button } from "@headlessui/react"
import { signOut } from "next-auth/react"
import { usePathname } from 'next/navigation'


 
export default function SignOut() {
  const pathname = usePathname();
  
  async function handleSignOut(){
    if(pathname.includes("profile")){
      await signOut({ callbackUrl: '/', redirect:true })
    } else {
      await signOut()
    }
  }

  return <Button 
            className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
            onClick={handleSignOut}>
            Sign out
        </Button>
}
