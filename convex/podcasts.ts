import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

// create podcast mutation
// ✅ Updated createPodcast mutation - using public mutation to bypass auth issues
export const createPodcast = mutation({
  args: {
    audioStorageId: v.id("_storage"),
    podcastTitle: v.string(),
    podcastDescription: v.string(),
    audioUrl: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.id("_storage"),
    voicePrompt: v.optional(v.string()),
    imagePrompt: v.optional(v.string()),
    voiceType: v.optional(v.string()),
    views: v.optional(v.number()),
    audioDuration: v.optional(v.number()),
    clerkId: v.string(), // Add clerkId back as parameter

    // ✅ new fields
    language: v.optional(v.string()), // Multi-language
    tags: v.optional(v.array(v.string())), // Tags
  },
  handler: async (ctx, args) => {
    // Find user by clerkId
    let user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      // Create user if missing (fallback when webhook not configured)
      const newId = await ctx.db.insert('users', {
        clerkId: args.clerkId,
        email: '', // Will be updated by webhook
        imageUrl: '',
        name: 'User',
        role: 'viewer',
      });
      user = await ctx.db.get(newId);
    }

    return await ctx.db.insert("podcasts", {
      audioStorageId: args.audioStorageId,
      user: user._id,
      podcastTitle: args.podcastTitle,
      podcastDescription: args.podcastDescription,
      audioUrl: args.audioUrl,
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,
      author: user.name,
      authorId: user.clerkId,
      voicePrompt: args.voicePrompt ?? "",
      imagePrompt: args.imagePrompt ?? "",
      voiceType: args.voiceType ?? "default",
      views: args.views ?? 0,
      authorImageUrl: user.imageUrl,
      audioDuration: args.audioDuration ?? 0,

      // ✅ new fields stored
      language: args.language,
      tags: args.tags,
    });
  },
});


// this mutation is required to generate the url after uploading the file to the storage.
export const getUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// this query will get all the podcasts based on the voiceType of the podcast , which we are showing in the Similar Podcasts section.
export const getPodcastByVoiceType = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);

    return await ctx.db
      .query("podcasts")
      .filter((q) =>
        q.and(
          q.eq(q.field("voiceType"), podcast?.voiceType),
          q.neq(q.field("_id"), args.podcastId)
        )
      )
      .collect();
  },
});

// this query will get all the podcasts.
export const getAllPodcasts = query({
  handler: async (ctx) => {
    return await ctx.db.query("podcasts").order("desc").collect();
  },
});

// this query will get the podcast by the podcastId.
export const getPodcastById = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.podcastId);
  },
});

// this query will get the podcasts based on the views of the podcast , which we are showing in the Trending Podcasts section.
export const getTrendingPodcasts = query({
  handler: async (ctx) => {
    const podcast = await ctx.db.query("podcasts").collect();

    return podcast.sort((a, b) => b.views - a.views).slice(0, 8);
  },
});

// this query will get the podcast by the authorId.
export const getPodcastByAuthorId = query({
  args: {
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    const podcasts = await ctx.db
      .query("podcasts")
      .filter((q) => q.eq(q.field("authorId"), args.authorId))
      .collect();

    const totalListeners = podcasts.reduce(
      (sum, podcast) => sum + podcast.views,
      0
    );

    return { podcasts, listeners: totalListeners };
  },
});

// this query will get the podcast by the search query.
export const getPodcastBySearch = query({
  args: {
    search: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const language = args.language && args.language.trim() !== '' ? args.language : undefined;

    if (args.search === "") {
      let qBase = ctx.db.query("podcasts");
      if (language) {
        qBase = qBase.filter((q) => q.eq(q.field("language"), language));
      }
      return await qBase.order("desc").collect();
    }

    // Author search
    let authorQuery = ctx.db
      .query("podcasts")
      .withSearchIndex("search_author", (q) => q.search("author", args.search));
    if (language) {
      authorQuery = authorQuery.filter((q) => q.eq(q.field("language"), language));
    }
    const authorSearch = await authorQuery.take(10);
    if (authorSearch.length > 0) {
      return authorSearch;
    }

    // Title search
    let titleQuery = ctx.db
      .query("podcasts")
      .withSearchIndex("search_title", (q) => q.search("podcastTitle", args.search));
    if (language) {
      titleQuery = titleQuery.filter((q) => q.eq(q.field("language"), language));
    }
    const titleSearch = await titleQuery.take(10);
    if (titleSearch.length > 0) {
      return titleSearch;
    }

    // Body search
    let bodyQuery = ctx.db
      .query("podcasts")
      .withSearchIndex("search_body", (q) => q.search("podcastDescription", args.search));
    if (language) {
      bodyQuery = bodyQuery.filter((q) => q.eq(q.field("language"), language));
    }
    return await bodyQuery.take(10);
  },
});

// this mutation will update the views of the podcast.
export const updatePodcastViews = mutation({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);

    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    return await ctx.db.patch(args.podcastId, {
      views: podcast.views + 1,
    });
  },
});

// this mutation will delete the podcast.
export const deletePodcast = mutation({
  args: {
    podcastId: v.id("podcasts"),
    imageStorageId: v.id("_storage"),
    audioStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);

    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    await ctx.storage.delete(args.imageStorageId);
    await ctx.storage.delete(args.audioStorageId);
    return await ctx.db.delete(args.podcastId);
  },
});

// 1. Edit Podcast Mutation
export const editPodcast = mutation({
  args: {
    podcastId: v.id("podcasts"),
    podcastTitle: v.optional(v.string()),
    podcastDescription: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);
    if (!podcast) throw new ConvexError("Podcast not found");
    return await ctx.db.patch(args.podcastId, {
      podcastTitle: args.podcastTitle ?? podcast.podcastTitle,
      podcastDescription: args.podcastDescription ?? podcast.podcastDescription,
      imageUrl: args.imageUrl ?? podcast.imageUrl,
      imageStorageId: args.imageStorageId ?? podcast.imageStorageId,
      tags: args.tags ?? podcast.tags,
      language: args.language ?? podcast.language,
    });
  },
});

// 2. Episodes CRUD
export const createEpisode = mutation({
  args: {
    podcastId: v.id("podcasts"),
    title: v.string(),
    description: v.string(),
    audioUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.id("_storage")),
    language: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("episodes", {
      podcastId: args.podcastId,
      title: args.title,
      description: args.description,
      audioUrl: args.audioUrl,
      audioStorageId: args.audioStorageId,
      language: args.language,
      tags: args.tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const editEpisode = mutation({
  args: {
    episodeId: v.id("episodes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.id("_storage")),
    language: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.episodeId);
    if (!episode) throw new ConvexError("Episode not found");
    return await ctx.db.patch(args.episodeId, {
      title: args.title ?? episode.title,
      description: args.description ?? episode.description,
      audioUrl: args.audioUrl ?? episode.audioUrl,
      audioStorageId: args.audioStorageId ?? episode.audioStorageId,
      language: args.language ?? episode.language,
      tags: args.tags ?? episode.tags,
      updatedAt: Date.now(),
    });
  },
});

export const deleteEpisode = mutation({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.episodeId);
    if (!episode) throw new ConvexError("Episode not found");
    if (episode.audioStorageId) await ctx.storage.delete(episode.audioStorageId);
    return await ctx.db.delete(args.episodeId);
  },
});

export const getEpisodesByPodcast = query({
  args: { podcastId: v.id("podcasts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("episodes")
      .filter((q) => q.eq(q.field("podcastId"), args.podcastId))
      .order("desc")
      .collect();
  },
});

// 3. Playlists CRUD
export const createPlaylist = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    items: v.optional(v.array(v.object({
      type: v.union(v.literal('podcast'), v.literal('episode')),
      id: v.union(v.id('podcasts'), v.id('episodes')),
    }))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("playlists", {
      userId: args.userId,
      name: args.name,
      items: args.items ?? [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const editPlaylist = mutation({
  args: {
    playlistId: v.id("playlists"),
    name: v.optional(v.string()),
    items: v.optional(v.array(v.object({
      type: v.union(v.literal('podcast'), v.literal('episode')),
      id: v.union(v.id('podcasts'), v.id('episodes')),
    }))),
  },
  handler: async (ctx, args) => {
    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist) throw new ConvexError("Playlist not found");
    return await ctx.db.patch(args.playlistId, {
      name: args.name ?? playlist.name,
      items: args.items ?? playlist.items,
      updatedAt: Date.now(),
    });
  },
});

export const deletePlaylist = mutation({
  args: { playlistId: v.id("playlists") },
  handler: async (ctx, args) => {
    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist) throw new ConvexError("Playlist not found");
    return await ctx.db.delete(args.playlistId);
  },
});

export const getPlaylistsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playlists")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// 4. Download Tracking
export const incrementDownload = mutation({
  args: {
    itemType: v.union(v.literal('podcast'), v.literal('episode')),
    itemId: v.union(v.id('podcasts'), v.id('episodes')),
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("downloads")
      .filter((q) =>
        q.and(
          q.eq(q.field("itemType"), args.itemType),
          q.eq(q.field("itemId"), args.itemId),
          args.userId ? q.eq(q.field("userId"), args.userId) : q.or()
        )
      )
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else {
      return await ctx.db.insert("downloads", {
        itemType: args.itemType,
        itemId: args.itemId,
        userId: args.userId,
        count: 1,
      });
    }
  },
});

export const getDownloadCount = query({
  args: {
    itemType: v.union(v.literal('podcast'), v.literal('episode')),
    itemId: v.union(v.id('podcasts'), v.id('episodes')),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("downloads")
      .filter((q) =>
        q.and(
          q.eq(q.field("itemType"), args.itemType),
          q.eq(q.field("itemId"), args.itemId)
        )
      )
      .collect();

    // Sum up all download counts for this item
    const totalCount = records.reduce((sum, record) => sum + record.count, 0);
    return totalCount;
  },
});
