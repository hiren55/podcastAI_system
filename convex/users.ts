import { ConvexError, v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";

export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return user;
  },
});

export const getUserRole = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();
    if (!user) return 'viewer';
    return user.role || 'viewer';
  }
});

export const setUserRole = mutation({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Not authenticated');
    let user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), identity.subject))
      .unique();
    if (!user) {
      // Create user if missing (fallback when webhook not configured)
      const newId = await ctx.db.insert('users', {
        clerkId: identity.subject,
        email: identity.email || '',
        imageUrl: (identity as any).imageUrl || (identity as any).pictureUrl || '',
        name: identity.name || identity.givenName || 'User',
        role: 'viewer',
      });
      user = await ctx.db.get(newId);
    }
    await ctx.db.patch(user!._id, { role: args.role });
    return args.role;
  }
});

export const setUserRoleByClerkId = mutation({
  args: { clerkId: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), args.clerkId))
      .unique();
    if (!user) {
      const newId = await ctx.db.insert('users', {
        clerkId: args.clerkId,
        email: '',
        imageUrl: '',
        name: 'User',
        role: 'viewer',
      });
      user = await ctx.db.get(newId);
    }
    await ctx.db.patch(user!._id, { role: args.role });
    return args.role;
  }
});

// Public query to get top users by podcast count (and views)
export const getTopUserByPodcastCount = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    const userData = await Promise.all(
      users.map(async (u) => {
        const podcasts = await ctx.db
          .query('podcasts')
          .filter((q) => q.eq(q.field('authorId'), u.clerkId))
          .collect();
        const sorted = podcasts.sort((a, b) => b.views - a.views);
        return {
          ...u,
          totalPodcasts: podcasts.length,
          podcast: sorted.map((p) => ({ podcastTitle: p.podcastTitle, podcastId: p._id })),
        };
      })
    );
    return userData.sort((a, b) => b.totalPodcasts - a.totalPodcasts);
  },
});

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      imageUrl: args.imageUrl,
      name: args.name,
      role: 'viewer',
    });
  },
});

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    imageUrl: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      imageUrl: args.imageUrl,
      email: args.email,
    });

    const podcast = await ctx.db
      .query("podcasts")
      .filter((q) => q.eq(q.field("authorId"), args.clerkId))
      .collect();

    await Promise.all(
      podcast.map(async (p) => {
        await ctx.db.patch(p._id, {
          authorImageUrl: args.imageUrl,
        });
      })
    );
  },
});

export const updateUserRole = internalMutation({
  args: { clerkId: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), args.clerkId))
      .unique();
    if (!user) throw new ConvexError('User not found');
    await ctx.db.patch(user._id, { role: args.role });
  }
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.delete(user._id);
  },
});
