import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  podcasts: defineTable({
    user: v.id('users'),
    podcastTitle: v.string(),
    podcastDescription: v.string(),
    audioUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.id('_storage')),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    author: v.string(),
    authorId: v.string(),
    authorImageUrl: v.string(),
    voicePrompt: v.string(),
    imagePrompt: v.string(),
    voiceType: v.string(),
    audioDuration: v.number(),
    views: v.number(),
    tags: v.optional(v.array(v.string())),
    language: v.optional(v.string()),
  })
    .searchIndex('search_author', { searchField: 'author' })
    .searchIndex('search_title', { searchField: 'podcastTitle' })
    .searchIndex('search_body', { searchField: 'podcastDescription' }),
  episodes: defineTable({
    podcastId: v.id('podcasts'),
    title: v.string(),
    description: v.string(),
    audioUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.id('_storage')),
    language: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  playlists: defineTable({
    userId: v.id('users'),
    name: v.string(),
    items: v.array(v.object({
      type: v.union(v.literal('podcast'), v.literal('episode')),
      id: v.union(v.id('podcasts'), v.id('episodes')),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  downloads: defineTable({
    itemType: v.union(v.literal('podcast'), v.literal('episode')),
    itemId: v.union(v.id('podcasts'), v.id('episodes')),
    userId: v.optional(v.id('users')),
    count: v.number(),
  }),
  users: defineTable({
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    name: v.string(),
    role: v.optional(v.string()),
  })
})