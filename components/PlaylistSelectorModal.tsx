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

export default function PlaylistSelectorModal({
    open,
    onOpenChange,
    itemType,
    itemId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemType: 'podcast' | 'episode';
    itemId: Id<'podcasts'> | Id<'episodes'>;
}) {
    const { user } = useUser();
    const userRecord = useQuery(api.users.getUserById, user?.id ? { clerkId: user.id } : 'skip');
    const userId = userRecord?._id as Id<'users'> | undefined;
    const playlists = useQuery(api.podcasts.getPlaylistsByUser, userId ? { userId } : 'skip');
    const editPlaylist = useMutation(api.podcasts.editPlaylist);
    const createPlaylist = useMutation(api.podcasts.createPlaylist);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [creating, setCreating] = useState(false);
    const { toast } = useToast();

    async function handleAddToPlaylist(playlist: PlaylistProps) {
        if (!userId) return;
        if (!playlist.items.some(i => i.type === itemType && i.id === itemId)) {
            await editPlaylist({
                playlistId: playlist._id,
                items: [...playlist.items, { type: itemType, id: itemId }],
            });
            toast({ title: 'Added to playlist!' });
        } else {
            toast({ title: 'Already in playlist', variant: 'destructive' });
        }
        onOpenChange(false);
    }

    async function handleCreateAndAdd() {
        if (!userId || !newPlaylistName.trim()) return;
        setCreating(true);
        await createPlaylist({
            userId,
            name: newPlaylistName.trim(),
            items: [{ type: itemType, id: itemId }],
        });
        setNewPlaylistName('');
        setCreating(false);
        toast({ title: 'Playlist created and item added!' });
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto bg-black-1 border-glass">
                <DialogHeader className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                            <span className="text-xl">🎵</span>
                        </div>
                        <DialogTitle className="text-2xl font-bold ai-gradient-text">Add to Playlist</DialogTitle>
                    </div>
                    <p className="text-tertiary">Add this content to an existing playlist or create a new one</p>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="card-ai-glass p-6">
                        <h3 className="text-lg font-semibold ai-glow-text mb-4">Select a Playlist</h3>
                        <ul className="space-y-3">
                            {playlists?.map(pl => (
                                <li key={pl._id}>
                                    <Button
                                        className="w-full justify-between bg-black-2 text-white-1 hover:bg-black-3 border border-glass rounded-lg p-4"
                                        onClick={() => handleAddToPlaylist(pl)}
                                        disabled={!userId}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>🎵</span> {pl.name}
                                        </span>
                                        <span className="text-sm text-muted">({pl.items.length} items)</span>
                                    </Button>
                                </li>
                            ))}
                            {playlists?.length === 0 && (
                                <li className="text-center py-8">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                                        <span className="text-2xl">📭</span>
                                    </div>
                                    <p className="text-tertiary">No playlists yet.</p>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="card-ai-glass p-6">
                        <h3 className="text-lg font-semibold ai-glow-text mb-4">Or Create New</h3>
                        <div className="space-y-4">
                            <Input
                                value={newPlaylistName}
                                onChange={e => setNewPlaylistName(e.target.value)}
                                placeholder="Playlist name"
                                disabled={creating || !userId}
                                className="form-input-dark"
                            />
                            <Button
                                onClick={handleCreateAndAdd}
                                className="btn-ai-neon w-full"
                                disabled={creating || !userId}
                            >
                                {creating ? 'Creating...' : 'Create & Add'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
