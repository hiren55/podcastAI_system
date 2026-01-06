/* eslint-disable no-unused-vars */

import { Dispatch, SetStateAction } from "react";

import { Id } from "@/convex/_generated/dataModel";

export interface EmptyStateProps {
  title: string;
  search?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

export interface TopPodcastersProps {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  imageUrl: string;
  clerkId: string;
  name: string;
  podcast: {
    podcastTitle: string;
    podcastId: Id<"podcasts">;
  }[];
  totalPodcasts: number;
}

export interface PodcastProps {
  _id: Id<"podcasts">;
  _creationTime: number;
  audioStorageId: Id<"_storage"> | null;
  user: Id<"users">;
  podcastTitle: string;
  podcastDescription: string;
  audioUrl: string | null;
  imageUrl: string | null;
  imageStorageId: Id<"_storage"> | null;
  author: string;
  authorId: string;
  authorImageUrl: string;
  voicePrompt: string;
  imagePrompt: string | null;
  voiceType: string;
  audioDuration: number;
  views: number;
}

export interface ProfilePodcastProps {
  podcasts: PodcastProps[];
  listeners: number;
}

export interface GeneratePodcastProps {
  voiceType: string;
  setAudio: Dispatch<SetStateAction<string>>;
  audio: string;
  setAudioStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  voicePrompt: string;
  setVoicePrompt: Dispatch<SetStateAction<string>>;
  setAudioDuration: Dispatch<SetStateAction<number>>;
}

export interface GenerateThumbnailProps {
  setImage: Dispatch<SetStateAction<string>>;
  setImageStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  image: string;
  imagePrompt: string;
  setImagePrompt: Dispatch<SetStateAction<string>>;
}

export interface LatestPodcastCardProps {
  imgUrl: string;
  title: string;
  duration: string;
  index: number;
  audioUrl: string;
  author: string;
  views: number;
  podcastId: Id<"podcasts">;
}

export interface PodcastDetailPlayerProps {
  audioUrl: string;
  podcastTitle: string;
  author: string;
  isOwner: boolean;
  imageUrl: string;
  podcastId: Id<"podcasts">;
  podcastDescription: string;
  imageStorageId: Id<"_storage">;
  audioStorageId: Id<"_storage">;
  authorImageUrl: string;
  authorId: string;
}

export interface AudioProps {
  title: string;
  audioUrl: string;
  author: string;
  imageUrl: string;
  podcastId: string;
  playlistName?: string;
  episodeTitle?: string;
  podcastTitle?: string;
  currentTime?: number;
}

export interface AudioContextType {
  audio: AudioProps | undefined;
  setAudio: React.Dispatch<React.SetStateAction<AudioProps | undefined>>;
  playAudio: (newAudio: AudioProps) => void;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
}

export interface PodcastCardProps {
  imgUrl: string;
  title: string;
  description: string;
  podcastId: Id<"podcasts">;
  isOwner?: boolean; // NEW: for edit button visibility
  tags?: string[];   // NEW: for edit modal prefill
  language?: string; // NEW: for edit modal prefill
  onEdit?: () => void; // NEW: for triggering edit modal
  onAddToPlaylist?: () => void; // NEW: for playlist button
  audioUrl: string;
  author: string;
}

export interface PlaylistProps {
  _id: Id<'playlists'>;
  userId: Id<'users'>;
  name: string;
  items: { type: 'podcast' | 'episode'; id: Id<'podcasts'> | Id<'episodes'> }[];
  createdAt: number;
  updatedAt: number;
}

export interface CarouselProps {
  fansLikeDetail: TopPodcastersProps[];
}

export interface ProfileCardProps {
  podcastData: ProfilePodcastProps;
  imageUrl: string;
  userFirstName: string;
}

export type UseDotButtonType = {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
};

export interface EpisodeProps {
  _id: Id<'episodes'>;
  podcastId: Id<'podcasts'>;
  title: string;
  description: string;
  audioUrl?: string;
  audioStorageId?: Id<'_storage'>;
  language?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}
