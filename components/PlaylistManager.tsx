'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { PlaylistProps } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from './ui/use-toast';
import { Id } from '@/convex/_generated/dataModel';
import { useAudio } from '@/providers/AudioProvider';

export default function PlaylistManager() {
    const { user } = useUser();
    const userRecord = useQuery(api.users.getUserById, user?.id ? { clerkId: user.id } : 'skip');
    const userId = userRecord?._id as Id<'users'> | undefined;

    const playlists = useQuery(api.podcasts.getPlaylistsByUser, userId ? { userId } : 'skip');
    const allPodcasts = useQuery(api.podcasts.getAllPodcasts) || [];
    const createPlaylist = useMutation(api.podcasts.createPlaylist);
    const editPlaylist = useMutation(api.podcasts.editPlaylist);
    const deletePlaylist = useMutation(api.podcasts.deletePlaylist);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const { toast } = useToast();
        async function handleCreate() {
        if (!userId || !newPlaylistName.trim()) return;
        await createPlaylist({ userId, name: newPlaylistName.trim() });
        setNewPlaylistName('');
        setSheetOpen(false);
        toast({ title: 'Playlist created!' });
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Delete this playlist?')) return;
        await deletePlaylist({ playlistId: id });
        toast({ title: 'Playlist deleted' });
    }

    async function handleRemoveItem(pl: PlaylistProps, idx: number) {
        const newItems = [...pl.items];
        newItems.splice(idx, 1);
        await editPlaylist({ playlistId: pl._id, items: newItems });
        toast({ title: 'Item removed from playlist' });
    }

    if (!userRecord && user?.id) {
        return <div className="p-6 text-white-3">Loading your playlists...</div>;
    }

    return (
        <div className="p-6 relative overflow-hidden">
            {/* Floating Gradient Orbs */}
            <div className="floating-orb floating-orb-1"></div>
            <div className="floating-orb floating-orb-2"></div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                        <span className="text-2xl">🎵</span>
                    </div>
                    <h2 className="text-2xl font-bold ai-gradient-text">My Playlists</h2>
                </div>
                <Button onClick={() => setSheetOpen(true)} disabled={!userId} className="btn-ai-neon">
                    <span className="mr-2">+</span> New Playlist
                </Button>
            </div>
            <ul className="space-y-6">
                {playlists?.map(pl => (
                    <li key={pl._id} className="card-ai-glass p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold ai-glow-text">{pl.name}</h3>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(pl._id)} className="bg-red-600 hover:bg-red-700">
                                Delete
                            </Button>
                        </div>
                        <div className="mt-4">
                            <ul className="space-y-3">
                                {pl.items.length === 0 && (
                                    <li className="text-tertiary text-sm flex items-center gap-2">
                                        <span className="text-lg">📭</span>
                                        No items in this playlist.
                                    </li>
                                )}
                                {pl.items.map((item, idx) => {
                                    let title = '';
                                    let audioUrl = '';
                                    let author = '';
                                    let imageUrl = '';
                                    let podcastId = '';

                                    if (item.type === 'podcast') {
                                        const p = allPodcasts.find(p => p._id === item.id);
                                        if (p) {
                                            title = p.podcastTitle;
                                            audioUrl = p.audioUrl || '';
                                            author = p.author;
                                            imageUrl = p.imageUrl || '';
                                            podcastId = p._id;
                                        }
                                    } else {
                                        // Assuming episodes are also in allPodcasts for now, or need a separate query
                                        const p = allPodcasts.find(p => p._id === item.id);
                                        if (p) {
                                            title = p.podcastTitle; // Or episode title if available
                                            audioUrl = p.audioUrl || '';
                                            author = p.author;
                                            imageUrl = p.imageUrl || '';
                                            podcastId = p._id;
                                        }
                                    }
                                    return (
                                        <li key={idx} className="flex items-center justify-between bg-black-2 rounded-lg p-3 cursor-pointer hover:bg-black-3 transition-colors" onClick={() => playAudio({
                                            title: title,
                                            audioUrl: audioUrl,
                                            author: author,
                                            imageUrl: imageUrl,
                                            podcastId: podcastId,
                                            playlistName: pl.name,
                                            episodeTitle: item.type === 'episode' ? title : undefined,
                                            podcastTitle: item.type === 'podcast' ? title : undefined,
                                        })}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{item.type === 'podcast' ? '🎙️' : '🎵'}</span>
                                                <span className="text-white-1 text-sm">{title}</span>
                                            </div>
                                            <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleRemoveItem(pl, idx); }} className="bg-red-600 hover:bg-red-700 text-xs">
                                                Remove
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </li>
                ))}
                {playlists?.length === 0 && (
                    <li className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                            <span className="text-3xl">🎵</span>
                        </div>
                        <p className="text-tertiary text-lg">No playlists yet.</p>
                        <p className="text-muted text-sm mt-2">Create your first playlist to get started!</p>
                    </li>
                )}
            </ul>
            <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
                <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto bg-black-1 border-glass">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                                <span className="text-xl">➕</span>
                            </div>
                            <DialogTitle className="text-2xl font-bold ai-gradient-text">New Playlist</DialogTitle>
                        </div>
                        <p className="text-tertiary">Create a new playlist to organize your favorite content</p>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="card-ai-glass p-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold ai-glow-text">Playlist Name</label>
                                <Input
                                    value={newPlaylistName}
                                    onChange={e => setNewPlaylistName(e.target.value)}
                                    placeholder="Enter playlist name"
                                    className="form-input-dark"
                                />
                            </div>
                        </div>
                        <Button onClick={handleCreate} disabled={!userId} className="btn-ai-neon w-full py-3">
                            <span className="mr-2">✨</span> Create Playlist
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
