'use client'

import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useDebounce } from '@/lib/useDebounce'

const Searchbar = () => {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const debouncedValue = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedValue) {
      router.push(`/discover?search=${debouncedValue}`)
    } else if (!debouncedValue && pathname === '/discover') router.push('/discover')
  }, [router, pathname, debouncedValue])

  return (
    <div className="relative">
      <div className="relative">
        <Input
          className="bg-black-2 border-2 border-gray-6 text-white-1 py-2 pl-10 pr-4 text-sm placeholder:text-muted focus:ring-2 focus:ring-gray-5 focus:border-gray-5 rounded-lg"
          placeholder='Search for podcasts...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onLoad={() => setSearch('')}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <div className="w-5 h-5 rounded bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
            <Image
              src="/icons/search.svg"
              alt="search"
              height={12}
              width={12}
              className="opacity-80"
            />
          </div>
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-gray-6 hover:bg-gray-5 flex items-center justify-center transition-colors"
          >
            <span className="text-white-1 text-xs">×</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default Searchbar