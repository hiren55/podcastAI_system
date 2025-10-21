"use client"

import EmptyState from '@/components/EmptyState'
import LoaderSpinner from '@/components/LoaderSpinner'
import PodcastCard from '@/components/PodcastCard'
import Searchbar from '@/components/Searchbar'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import React, { useState } from 'react'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/providers/LanguageProvider';
import { t } from '@/lib/utils';
import PlaylistSelectorModal from '@/components/PlaylistSelectorModal';

const languageOptions = [
  'All', 'English', 'Hindi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese', 'Urdu', 'Other'
];

const Discover = ({ searchParams: { search } }: { searchParams: { search: string } }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const { lang } = useLanguage();
  const podcastsData = useQuery(api.podcasts.getPodcastBySearch, { search: search || '', language: selectedLanguage === 'All' ? '' : selectedLanguage });
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlistPodcastId, setPlaylistPodcastId] = useState<Id<'podcasts'> | null>(null);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
          <span className="text-lg">🔍</span>
        </div>
        <h1 className="text-xl font-bold ai-gradient-text">
          {!search ? t('discover', lang) : t('searchResults', lang)}
        </h1>
        {search && (
          <span className="text-sm text-tertiary">
            for: <span className="ai-glow-text">{search}</span>
          </span>
        )}
      </div>

      {/* Search Bar */}
      <Searchbar />

      {/* Filter Section */}
      <div className="card-ai-glass p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
              <span className="text-sm">🌐</span>
            </div>
            <label className="text-sm font-semibold ai-glow-text">{t('filterByLanguage', lang)}</label>
          </div>
          <select
            className="form-input-dark max-w-xs text-sm py-2"
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
          >
            {languageOptions.map(langOpt => (
              <option key={langOpt} value={langOpt} className="text-white-1 bg-black-2">{langOpt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Section */}
      <div>
        {podcastsData ? (
          <>
            {podcastsData.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {podcastsData?.map(({ _id, podcastTitle, podcastDescription, imageUrl, language }) => (
                  <PodcastCard
                    key={_id}
                    imgUrl={imageUrl!}
                    title={podcastTitle}
                    description={podcastDescription}
                    podcastId={_id}
                    language={language}
                    onAddToPlaylist={() => { setPlaylistPodcastId(_id); setPlaylistModalOpen(true); }}
                  />
                ))}
              </div>
            ) : (
              <div className="card-ai-glass p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-bold ai-glow-text mb-2">No Results Found</h3>
                <p className="text-tertiary text-sm">Try adjusting your search terms or filters</p>
              </div>
            )}
          </>
        ) : (
          <div className="card-ai-glass p-8 text-center">
            <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
              <LoaderSpinner />
            </div>
            <p className="text-tertiary text-sm">Loading podcasts...</p>
          </div>
        )}
      </div>
      <PlaylistSelectorModal
        open={playlistModalOpen}
        onOpenChange={open => { setPlaylistModalOpen(open); if (!open) setPlaylistPodcastId(null); }}
        itemType="podcast"
        itemId={(playlistPodcastId as Id<'podcasts'>)}
      />
    </div>
  );
}

export default Discover