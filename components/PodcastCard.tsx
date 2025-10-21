import { PodcastCardProps } from '@/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useAudio } from '@/providers/AudioProvider'

const PodcastCard = ({
  imgUrl, title, description, podcastId, isOwner, onEdit, language, onAddToPlaylist, audioUrl, author
}: PodcastCardProps) => {
  const router = useRouter()
  const { playAudio } = useAudio();

  const handleViews = () => {
    playAudio({
      title: title,
      audioUrl: audioUrl,
      author: author,
      imageUrl: imgUrl,
      podcastId: podcastId,
      podcastTitle: title,
    });
    router.push(`/podcasts/${podcastId}`, {
      scroll: true
    })
  }

  return (
    <div className="card-ai-podcast p-4 cursor-pointer group" onClick={handleViews}>
      <div className="relative mb-3">
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src={imgUrl}
            width={150}
            height={150}
            alt={title}
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Language Badge */}
        {language && (
          <span className="absolute top-2 left-2 z-10 rounded-md bg-gradient-to-r from-gray-6 to-gray-5 px-2 py-1 text-xs font-semibold text-white-1 shadow-lg">
            {language}
          </span>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {isOwner && onEdit && (
            <button
              className="rounded-md bg-black-2/80 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-white-1 shadow-lg hover:bg-black-3/90 transition-colors"
              onClick={e => { e.stopPropagation(); onEdit(); }}
            >
              ✏️
            </button>
          )}
          {onAddToPlaylist && (
            <button
              className="rounded-md bg-gradient-to-r from-gray-6 to-gray-5 px-2 py-1 text-xs font-semibold text-white-1 shadow-lg hover:from-gray-5 hover:to-gray-4 transition-all"
              onClick={e => { e.stopPropagation(); onAddToPlaylist(); }}
            >
              🎵
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-sm font-bold ai-glow-text line-clamp-2 group-hover:text-white-1 transition-colors">
          {title}
        </h1>
        <p className="text-xs text-tertiary line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

export default PodcastCard