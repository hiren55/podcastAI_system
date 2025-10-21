'use client';

import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'
import { cn } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Carousel from './Carousel';

const RightSidebar = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const topPodcasters = useQuery(api.users.getTopUserByPodcastCount);
  const router = useRouter();

  return (
    <>
      {/* Fixed Toggle Button - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center hover:from-gray-5 hover:to-gray-4 transition-all shadow-lg border border-glass"
      >
        <Image
          src="/icons/hamburger.svg"
          alt="menu"
          width={20}
          height={20}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black-1/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <section className={cn('fixed top-0 right-0 h-screen bg-gradient-to-b from-black-1 to-black-2 border-l border-glass transition-all duration-300 z-50 flex flex-col', {
        'w-0 translate-x-full': !isOpen,
        'w-80': isOpen
      })}>
        {/* Header with Logo and Name */}
        <div className="p-6 border-b border-glass flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
              <Image
                src="/icons/logo.svg"
                alt="Podcastr"
                width={28}
                height={28}
                className="filter brightness-0 invert"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold ai-gradient-text">
                Podcastr
              </h1>
              <p className="text-sm text-tertiary">AI Podcast Platform</p>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-glass flex-shrink-0">
          <SignedIn>
            <Link href={`/profile/${user?.id}`} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                <UserButton />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold ai-glow-text truncate">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-tertiary">View Profile</p>
              </div>
              <Image
                src="/icons/right-arrow.svg"
                alt="arrow"
                width={16}
                height={16}
                className="opacity-60 group-hover:opacity-100 transition-opacity"
              />
            </Link>
          </SignedIn>
        </div>

        {/* Sidebar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-ai">
          <div className="p-6 space-y-6">
            {/* Fans Like You Section */}
            {topPodcasters && topPodcasters.length > 0 && (
              <section>
                <Header headerTitle="Fans Like You" />
                <Carousel fansLikeDetail={topPodcasters} />
              </section>
            )}

            {/* Top Podcasters Section */}
            {topPodcasters && topPodcasters.length > 0 && (
              <section className="space-y-4">
                <Header headerTitle="Top Podcasters" />
                <div className="space-y-3">
                  {topPodcasters?.slice(0, 3).map((podcaster) => (
                    <div
                      key={podcaster._id}
                      className="flex cursor-pointer justify-between p-3 rounded-lg hover:bg-black-2/50 transition-colors group"
                      onClick={() => router.push(`/profile/${podcaster.clerkId}`)}
                    >
                      <figure className="flex items-center gap-3">
                        <Image
                          src={podcaster.imageUrl}
                          alt={podcaster.name}
                          width={36}
                          height={36}
                          className="aspect-square rounded-lg"
                        />
                        <div>
                          <h4 className="text-sm font-semibold ai-glow-text group-hover:text-white-1 transition-colors">
                            {podcaster.name}
                          </h4>
                          <p className="text-xs text-tertiary">
                            {podcaster.totalPodcasts} podcasts
                          </p>
                        </div>
                      </figure>
                      <Image
                        src="/icons/right-arrow.svg"
                        alt="arrow"
                        width={12}
                        height={12}
                        className="opacity-60 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default RightSidebar