'use client';

import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { SignedIn, SignedOut, useClerk } from '@clerk/nextjs';
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button } from './ui/button';
import { useAudio } from '@/providers/AudioProvider';

const LeftSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { audio } = useAudio();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <section className={cn("left_sidebar h-[calc(100vh-5px)] bg-gradient-to-b from-black-1 via-black-2 to-black-1 border-r border-glass relative overflow-hidden", {
      'h-[calc(100vh-140px)]': audio?.audioUrl
    })}>
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 w-32 h-32 bg-gradient-to-r from-gray-6/10 to-gray-5/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-2 w-24 h-24 bg-gradient-to-r from-gray-5/10 to-gray-6/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-gray-6/5 to-gray-5/5 rounded-full blur-md animate-pulse delay-500"></div>
      </div>

      {/* Header with Animated Logo */}
      <div className="relative z-10 p-6 border-b border-glass/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Image src="/icons/logo.svg" alt="logo" width={24} height={24} className="filter brightness-0 invert group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 opacity-0 group-hover:opacity-20 blur-md transition-all duration-300"></div>
          </div>
          <div className="max-lg:hidden">
            <h1 className="text-xl font-bold ai-gradient-text group-hover:scale-105 transition-transform duration-300">
              Podcastr
            </h1>
            <p className="text-xs text-tertiary group-hover:text-white-1 transition-colors duration-300">
              AI Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation with Enhanced Animations */}
      <nav className="relative z-10 flex-1 p-4 space-y-2">
        {sidebarLinks.map(({ route, label, imgURL }, index) => {
          const isActive = pathname === route || pathname.startsWith(`${route}/`);
          const isHovered = hoveredItem === label;

          return (
            <Link
              href={route}
              key={label}
              className="block"
              onMouseEnter={() => setHoveredItem(label)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden",
                {
                  'bg-gradient-to-r from-gray-6/30 to-gray-5/30 border border-glass/50 ai-glow-text shadow-lg scale-105': isActive,
                  'hover:bg-black-2/60 hover:scale-105 hover:shadow-md': !isActive
                }
              )}>
                {/* Animated Background */}
                <div className={cn(
                  "absolute inset-0 rounded-xl transition-all duration-300",
                  {
                    'bg-gradient-to-r from-gray-6/20 to-gray-5/20': isActive,
                    'bg-gradient-to-r from-gray-6/10 to-gray-5/10 opacity-0 group-hover:opacity-100': !isActive
                  }
                )}></div>

                {/* Icon Container */}
                <div className={cn(
                  "relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                  {
                    'bg-gradient-to-r from-gray-6 to-gray-5 shadow-lg': isActive,
                    'bg-gray-6/40 group-hover:bg-gray-6/60': !isActive
                  }
                )}>
                  <Image
                    src={imgURL}
                    alt={label}
                    width={18}
                    height={18}
                    className={cn(
                      "filter brightness-0 invert transition-all duration-300",
                      {
                        'drop-shadow-lg': isActive,
                        'group-hover:scale-110': !isActive
                      }
                    )}
                  />
                  {/* Glow Effect */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-6 to-gray-5 opacity-30 blur-sm animate-pulse"></div>
                  )}
                </div>

                {/* Text */}
                <span className={cn(
                  "relative text-sm font-medium transition-all duration-300",
                  {
                    'ai-glow-text': isActive,
                    'text-tertiary group-hover:text-white-1': !isActive
                  }
                )}>
                  {label}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-gradient-to-r from-gray-6 to-gray-5 rounded-full animate-pulse"></div>
                )}

                {/* Hover Effect */}
                {isHovered && !isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-gray-6/5 to-transparent animate-pulse"></div>
                )}
              </div>
            </Link>
          );
        })}

        {/* Playlists Link with Enhanced Animation */}
        <Link
          href="/playlists"
          className="block"
          onMouseEnter={() => setHoveredItem('playlists')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          
        </Link>
      </nav>

      {/* Enhanced Auth Buttons */}
      <div className="relative z-10 p-4 border-t border-glass/50">
        <SignedOut>
          <div className="flex-center w-full pb-4">
            <Button asChild className="w-full font-semibold btn-ai-neon hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex-center w-full pb-4">
            <Button
              className="w-full font-semibold btn-ai-neon hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => signOut(() => router.push('/'))}
            >
              Log Out
            </Button>
          </div>
        </SignedIn>
      </div>
    </section>
  )
}

export default LeftSidebar