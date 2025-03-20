"use client";
import { usePathname } from 'next/navigation'
import { Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import "../globals.css";
import CalayoHeader from './components/calayoHeader';
import ProfileDropDown from '../components/profileDropdown';
import { SessionProvider, useSession } from "next-auth/react"
import { Button } from '@/components/ui/button';
import Link from 'next/link';



const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
  { name: 'Pieces', href: '/home', current: false },
  { name: 'Commissions', href: '/home/commissions', current: false },
  { name: 'Projects', href: '#', current: false },
  { name: 'About me', href: '#', current: false },
]



function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
  }

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const pathname = usePathname()
    const notHome = (pathname !== "/home")
    const { data: session } = useSession()
    

    if(pathname == "/home"){
        navigation[0].current = true
        navigation[1].current = false
        navigation[2].current = false
        navigation[3].current = false
    } else if(pathname == "/home/commissions" || pathname == "/home/commissions/admin" ){
        navigation[0].current = false
        navigation[1].current = true
        navigation[2].current = false
        navigation[3].current = false
    }
  
  return (
      <div className="min-h-full">
        <div className="bg-green-900 pb-32">
          <Disclosure as="nav" className="bg-green-900">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="border-b border-white-700">
                <div className="flex h-16 items-center justify-between px-4 sm:px-0">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      {/* <Image
                        alt="Your Company"
                        fill={true}
                        src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
                        className="size-8"
                      /> */}
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            aria-current={item.current ? 'page' : undefined}
                            className={classNames(
                              item.current
                                ? 'bg-green-950 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                              'rounded-md px-3 py-2 text-sm font-medium',
                            )}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="space-x-4 ml-4 flex items-center md:ml-6">
                      {session?.user?.role ==="admin" && (
                        <div className="relative ml-3">
                          <Link href="/home/commissions/admin">
                            <Button className="bg-green-950 text-white rounded-md px-3 py-2 text-sm font-medium">
                              Admin
                            </Button>
                          </Link>
                        </div>
                      )}
                      <button
                        type="button"
                        className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">View notifications</span>
                        <BellIcon aria-hidden="true" className="size-6" />
                      </button>
                        <ProfileDropDown/>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Open main menu</span>
                      <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
                      <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
                    </DisclosureButton>
                  </div>
                </div>
              </div>
            </div>

            <DisclosurePanel className="border-b border-gray-700 md:hidden">
              <div className="space-y-1 px-2 py-3 sm:px-3">
                {navigation.map((item) => (
                  <DisclosureButton
                    key={item.name}
                    as="a"
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium',
                    )}
                  >
                    {item.name}
                  </DisclosureButton>
                ))}
              </div>
              <div className="border-t border-gray-700 pb-3 pt-4">
                <div className="flex items-center px-5">
                  <div className="shrink-0">
                    {/* <Image  fill={true} alt="" src={user.imageUrl} className="size-10 rounded-full" /> */}
                  </div>
                  <div className="ml-3">
                    <div className="text-base/5 font-medium text-white">{user.name}</div>
                    <div className="text-sm font-medium text-gray-400">{user.email}</div>
                  </div>
                  <button
                    type="button"
                    className="relative ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
                <ProfileDropDown/>
              </div>
            </DisclosurePanel>
          </Disclosure>
          <div>
          <CalayoHeader isHome={notHome}/>
          </div>
         
        </div>
        <SessionProvider>
        {children}
        </SessionProvider>
      </div>
  );
}
