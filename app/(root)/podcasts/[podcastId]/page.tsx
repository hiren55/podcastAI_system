'use client'

import EmptyState from '@/components/EmptyState'
import LoaderSpinner from '@/components/LoaderSpinner'
import PodcastCard from '@/components/PodcastCard'
import PodcastDetailPlayer from '@/components/PodcastDetailPlayer'
import PodcastEditSheet from '@/components/PodcastEditSheet';
import EpisodeManager from '@/components/EpisodeManager';
import PlaylistSelectorModal from '@/components/PlaylistSelectorModal';
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import Image from 'next/image'
import React from 'react'

const PodcastDetails = ({ params: { podcastId } }: { params: { podcastId: Id<'podcasts'> } }) => {
  const { user } = useUser();
  const [editOpen, setEditOpen] = React.useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = React.useState(false);
  const [playlistPodcastId, setPlaylistPodcastId] = React.useState<Id<'podcasts'> | null>(null);

  const podcast = useQuery(api.podcasts.getPodcastById, { podcastId });
  const similarPodcasts = useQuery(api.podcasts.getPodcastByVoiceType, { podcastId });
  const downloadCount = useQuery(api.podcasts.getDownloadCount, { itemType: 'podcast', itemId: podcastId });
  const incrementDownload = useMutation(api.podcasts.incrementDownload);
  const isOwner = user?.id === podcast?.authorId;

  if (!similarPodcasts || !podcast) return <LoaderSpinner />;

  const handleDownloadAudio = async () => {
    if (!podcast.audioUrl) return;
    try {
      await incrementDownload({ itemType: 'podcast', itemId: podcastId });
    } catch { }
    const a = document.createElement('a');
    a.href = podcast.audioUrl as string;
    a.download = `${podcast.podcastTitle}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleExportDescription = () => {
    const blob = new Blob([podcast.podcastDescription || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${podcast.podcastTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex w-full flex-col relative">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-r from-gray-6/10 to-gray-5/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-1/3 w-24 h-24 bg-gradient-to-r from-gray-5/10 to-gray-6/10 rounded-full blur-lg animate-pulse delay-1000"></div>
      </div>

      {/* Enhanced Header */}
      <header className="relative z-10 mt-9 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <h1 className="text-3xl font-bold ai-gradient-text">
              Currently Playing
            </h1>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-gray-6 to-gray-5 rounded-full"></div>
          </div>
        </div>

        <figure className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl card-ai-glass border border-glass">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
              <span className="text-sm">🎧</span>
            </div>
            <h2 className="text-lg font-bold ai-glow-text">{podcast?.views || 0}</h2>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl card-ai-glass border border-glass">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
              <span className="text-sm">⬇️</span>
            </div>
            <span className="text-lg font-bold ai-glow-text">{downloadCount ?? 0}</span>
          </div>
        </figure>

        <div className="flex items-center gap-3">
          <button
            className="px-6 py-3 rounded-xl btn-ai-neon font-semibold transition-all duration-300 hover:scale-105"
            onClick={() => { setPlaylistPodcastId(podcast._id); setPlaylistModalOpen(true); }}
          >
            + Playlist
          </button>
          {isOwner && (
            <button
              className="px-6 py-3 rounded-xl btn-ai-glass font-semibold transition-all duration-300 hover:scale-105"
              onClick={() => setEditOpen(true)}
            >
              Edit Podcast
            </button>
          )}
        </div>
      </header>

      {/* Enhanced Action Buttons */}
      <div className="relative z-10 mt-6 flex gap-4">
        <button
          className="px-6 py-3 rounded-xl btn-ai-glass font-semibold transition-all duration-300 hover:scale-105"
          onClick={handleDownloadAudio}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">⬇️</span>
            Download Audio
          </div>
        </button>
        <button
          className="px-6 py-3 rounded-xl btn-ai-glass font-semibold transition-all duration-300 hover:scale-105"
          onClick={handleExportDescription}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">📄</span>
            Export .txt
          </div>
        </button>
      </div>

      <PlaylistSelectorModal
        open={playlistModalOpen}
        onOpenChange={open => { setPlaylistModalOpen(open); if (!open) setPlaylistPodcastId(null); }}
        itemType="podcast"
        itemId={playlistPodcastId as Id<'podcasts'>}
      />
      <PodcastEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        podcast={{
          podcastId: podcast._id,
          podcastTitle: podcast.podcastTitle,
          podcastDescription: podcast.podcastDescription,
          imageUrl: podcast.imageUrl || '',
          tags: podcast.tags || [],
          language: podcast.language || '',
        }}
        onSuccess={() => { /* Optionally refetch or show toast */ }}
      />
      <PodcastDetailPlayer isOwner={isOwner} podcastId={podcast._id} {...podcast} />
      <EpisodeManager podcastId={podcast._id} isOwner={isOwner} />
      <p className="text-white-2 text-16 pb-8 pt-[45px] font-medium max-md:text-center">{podcast?.podcastDescription}</p>
      <div className="flex flex-col gap-8">
        <div className='flex flex-col gap-4'>
          <h1 className='text-18 font-bold text-white-1'>Transcription</h1>
          <p className="text-16 font-medium text-white-2">{podcast?.voicePrompt}</p>
        </div>
        <div className='flex flex-col gap-4'>
          <h1 className='text-18 font-bold text-white-1'>Thumbnail Prompt</h1>
          <p className="text-16 font-medium text-white-2">{podcast?.imagePrompt}</p>
        </div>
      </div>
      <section className="mt-8 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">Similar Podcasts</h1>
        {similarPodcasts && similarPodcasts.length > 0 ? (
          <div className="podcast_grid">
            {similarPodcasts?.map(({ _id, podcastTitle, podcastDescription, imageUrl }) => (
              <PodcastCard
                key={_id}
                imgUrl={imageUrl as string}
                title={podcastTitle}
                description={podcastDescription}
                podcastId={_id}
                onAddToPlaylist={() => { setPlaylistPodcastId(_id); setPlaylistModalOpen(true); }}
              />
            ))}
          </div>
        ) : (
          <>
            <EmptyState
              title="No similar podcasts found"
              buttonLink="/discover"
              buttonText="Discover more podcasts"
            />
          </>
        )}
      </section>
    </section>
  );
}

export default PodcastDetails