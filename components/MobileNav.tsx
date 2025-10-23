"use client"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { sidebarLinks } from "@/constants"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"


const MobileNav = () => {
  const pathname = usePathname();

  return (
    <section>
      <Sheet>
        <SheetTrigger>
          <Image src="/icons/hamburger.svg" width={30} height={30} alt="menu" className="cursor-pointer" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-black-1 z-50">
          <Link href="/" className="flex cursor-pointer items-center gap-1 pb-10 pl-4">
            <Image src="/icons/logo.svg" alt="logo" width={23} height={27} />
            <h1 className="text-24 font-extrabold ai-gradient-text ml-2">Podcastr</h1>
          </Link>
          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <nav className="flex h-full flex-col gap-6 text-white-1">
              {sidebarLinks.map(({ route, label, imgURL }) => {
                const isActive = pathname === route || pathname.startsWith(`${route}/`);

                return <SheetClose asChild key={route}><Link href={route} className={cn("flex gap-3 items-center py-4 max-lg:px-4 justify-start rounded-lg transition-all duration-300", {
                  'bg-gradient-to-r from-gray-6/30 to-gray-5/30 border border-glass/50 ai-glow-text shadow-lg': isActive,
                  'hover:bg-black-2/60': !isActive
                })}>
                  <Image src={imgURL} alt={label} width={24} height={24} />
                  <p className={cn("text-lg font-medium", {
                    'ai-glow-text': isActive,
                    'text-tertiary': !isActive
                  })}>{label}</p>
                </Link></SheetClose>
              })}
              </nav>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}

export default MobileNav