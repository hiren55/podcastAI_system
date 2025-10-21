import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { EpisodeProps } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from './ui/use-toast';
import KeywordToPodcast from './KeywordToPodcast';
import GeneratePodcast from './GeneratePodcast';
import PlaylistSelectorModal from './PlaylistSelectorModal';
import { useUploadFiles } from '@xixixao/uploadstuff/react';

const languageOptions = [
    'All', 'English', 'Hindi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese', 'Urdu', 'Other'
];

const voiceCategories = ['alloy', 'shimmer', 'nova', 'echo', 'fable', 'onyx'];

const episodeSchema = z.object({
    title: z.string().min(2, 'Title is required'),
    description: z.string().min(2, 'Description is required'),
    audioUrl: z.string().optional(),
    language: z.string().optional(),
    tags: z.string().optional(), // comma-separated
});

export default function EpisodeManager({ podcastId, isOwner }: { podcastId: Id<'podcasts'>, isOwner: boolean }) {
    const { toast } = useToast();
    const episodes = useQuery(api.podcasts.getEpisodesByPodcast, { podcastId });
    const createEpisode = useMutation(api.podcasts.createEpisode);
    const editEpisode = useMutation(api.podcasts.editEpisode);
    const deleteEpisode = useMutation(api.podcasts.deleteEpisode);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const getAudioUrl = useMutation(api.podcasts.getUrl);
    const { startUpload } = useUploadFiles(generateUploadUrl);

    const [sheetOpen, setSheetOpen] = useState(false);
    const [editing, setEditing] = useState<EpisodeProps | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('All');

    // Playlist modal states
    const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
    const [playlistEpisodeId, setPlaylistEpisodeId] = useState<Id<'episodes'> | null>(null);

    // AI generation states for episodes
    const [voiceType, setVoiceType] = useState<string | null>(null);
    const [voicePrompt, setVoicePrompt] = useState('');
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
    const [generatedAudioStorageId, setGeneratedAudioStorageId] = useState<Id<'_storage'> | null>(null);
    const [audioDuration, setAudioDuration] = useState(0);

    const filteredEpisodes = selectedLanguage === 'All'
        ? episodes
        : episodes?.filter(ep => ep.language === selectedLanguage);

    const form = useForm<z.infer<typeof episodeSchema>>({
        resolver: zodResolver(episodeSchema),
        defaultValues: {
            title: '',
            description: '',
            audioUrl: '',
            language: '',
            tags: '',
        },
    });

    function openAdd() {
        setEditing(null);
        const existingEpisodes = episodes || [];
        const nextEpisodeNumber = existingEpisodes.length + 1;
        form.reset({
            title: '',
            description: '',
            audioUrl: '',
            language: '',
            tags: '',
        });
        setVoiceType(null);
        setVoicePrompt('');
        setGeneratedAudioUrl('');
        setGeneratedAudioStorageId(null);
        setSheetOpen(true);
    }

    function openEdit(ep: EpisodeProps) {
        setEditing(ep);
        form.reset({
            title: ep.title,
            description: ep.description,
            audioUrl: ep.audioUrl || '',
            language: ep.language || '',
            tags: ep.tags?.join(', ') || '',
        });
        setVoiceType(null);
        setVoicePrompt('');
        setGeneratedAudioUrl('');
        setGeneratedAudioStorageId(null);
        setSheetOpen(true);
    }

    async function uploadAudioFile(file: File): Promise<{ audioUrl: string, audioStorageId: Id<'_storage'> }> {
        setUploading(true);
        const uploaded = await startUpload([file]);
        const storageId = (uploaded[0].response as any).storageId as Id<'_storage'>;
        const url = await getAudioUrl({ storageId });
        setUploading(false);
        return { audioUrl: url!, audioStorageId: storageId };
    }

    async function onSubmit(data: z.infer<typeof episodeSchema>) {
        try {
            let audioUrl = data.audioUrl || '';
            let audioStorageId: Id<'_storage'> | undefined = undefined;

            // Prefer AI-generated audio if present
            if (generatedAudioUrl && generatedAudioStorageId) {
                audioUrl = generatedAudioUrl;
                audioStorageId = generatedAudioStorageId;
            }

            // Enforce audio generation requirement
            if (!audioUrl || !audioStorageId) {
                toast({ title: 'Please generate audio before creating the episode', variant: 'destructive' });
                return;
            }

            if (editing) {
                await editEpisode({
                    episodeId: editing._id,
                    title: data.title,
                    description: data.description,
                    audioUrl,
                    audioStorageId,
                    language: data.language,
                    tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                });
                toast({ title: 'Episode updated!' });
            } else {
                // Generate automatic episode number
                const existingEpisodes = episodes || [];
                const nextEpisodeNumber = existingEpisodes.length + 1;
                const episodeTitle = `EP-${nextEpisodeNumber}: ${data.title}`;

                await createEpisode({
                    podcastId,
                    title: episodeTitle,
                    description: data.description,
                    audioUrl,
                    audioStorageId,
                    language: data.language,
                    tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                });
                toast({ title: `Episode EP-${nextEpisodeNumber} created!` });
            }
            setSheetOpen(false);
            setAudioFile(null);
        } catch (err) {
            toast({ title: 'Error saving episode', variant: 'destructive' });
        }
    }

    async function handleDelete(id: Id<'episodes'>) {
        if (!window.confirm('Delete this episode?')) return;
        await deleteEpisode({ episodeId: id });
        toast({ title: 'Episode deleted' });
    }

    return (
        <div className="mt-10 relative overflow-hidden">
            {/* Floating Gradient Orbs */}
            <div className="floating-orb floating-orb-1"></div>
            <div className="floating-orb floating-orb-2"></div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                        <span className="text-2xl">🎧</span>
                    </div>
                    <h2 className="text-2xl font-bold ai-gradient-text">Episodes</h2>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-3">
                        <label className="text-white-1 font-semibold ai-glow-text">Filter by Language:</label>
                        <select
                            className="form-input-dark max-w-xs"
                            value={selectedLanguage}
                            onChange={e => setSelectedLanguage(e.target.value)}
                        >
                            {languageOptions.map(lang => (
                                <option key={lang} value={lang} className="text-white-1 bg-black-2">{lang}</option>
                            ))}
                        </select>
                    </div>
                    {isOwner && (
                        <Button onClick={openAdd} className="btn-ai-neon">
                            <span className="mr-2">➕</span> Add Episode
                        </Button>
                    )}
                </div>
            </div>
            <ul className="space-y-6">
                {filteredEpisodes?.map(ep => (
                    <li key={ep._id} className="card-ai-glass p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold ai-glow-text mb-2">{ep.title}</h3>
                                <p className="text-tertiary mb-4 leading-relaxed">{ep.description}</p>
                                {ep.audioUrl && (
                                    <div className="mb-4">
                                        <audio controls src={ep.audioUrl} className="w-full max-w-md rounded-lg" />
                                    </div>
                                )}
                                <div className="flex items-center gap-4 text-sm text-muted">
                                    <span className="flex items-center gap-1">
                                        <span>🌐</span> {ep.language}
                                    </span>
                                    {ep.tags?.length && (
                                        <span className="flex items-center gap-1">
                                            <span>🏷️</span> {ep.tags.join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <Button size="sm" className="btn-ai-glass" onClick={() => { setPlaylistEpisodeId(ep._id); setPlaylistModalOpen(true); }}>
                                    <span className="mr-1">🎵</span> Playlist
                                </Button>
                                {isOwner && (
                                    <>
                                        <Button size="sm" onClick={() => openEdit(ep)} className="btn-ai-glass">
                                            <span className="mr-1">✏️</span> Edit
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(ep._id)} className="bg-red-600 hover:bg-red-700">
                                            <span className="mr-1">🗑️</span> Delete
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
                {filteredEpisodes?.length === 0 && (
                    <li className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                            <span className="text-3xl">🎧</span>
                        </div>
                        <p className="text-tertiary text-lg">No episodes yet.</p>
                        <p className="text-muted text-sm mt-2">Add your first episode to get started!</p>
                    </li>
                )}
            </ul>
            <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
                <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-black-1 border-glass">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                                <span className="text-xl">{editing ? '✏️' : '➕'}</span>
                            </div>
                            <DialogTitle className="text-2xl font-bold ai-gradient-text">
                                {editing ? 'Edit Episode' : `Add Episode (EP-${(episodes?.length || 0) + 1})`}
                            </DialogTitle>
                        </div>
                        <p className="text-tertiary">
                            {editing ? 'Update episode details with AI-powered features' : 'Create a new episode with AI-generated content'}
                        </p>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="card-ai-glass p-6 space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold ai-glow-text">Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Episode Title (EP number will be added automatically)" className="form-input-dark" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold ai-glow-text">Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Episode Description" className="form-textarea-dark" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* AI Generation Section - audio only */}
                            <div className="card-ai-glass p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                                        <span className="text-lg">🤖</span>
                                    </div>
                                    <h3 className="text-xl font-bold ai-glow-text">AI Generate Episode Audio</h3>
                                </div>
                                <div className="space-y-6">
                                    <KeywordToPodcast onUseScript={(s) => setVoicePrompt(s)} />
                                    <div className="space-y-3">
                                        <FormLabel className="text-sm font-semibold ai-glow-text">AI Voice</FormLabel>
                                        <select className="form-input-dark" value={voiceType || ''} onChange={e => setVoiceType(e.target.value)}>
                                            <option value="">Select AI Voice</option>
                                            {voiceCategories.map(v => <option key={v} value={v} className="text-white-1 bg-black-2">{v}</option>)}
                                        </select>
                                    </div>
                                    {voiceType && (
                                        <GeneratePodcast
                                            setAudioStorageId={setGeneratedAudioStorageId}
                                            setAudio={setGeneratedAudioUrl}
                                            voiceType={voiceType}
                                            audio={generatedAudioUrl}
                                            voicePrompt={voicePrompt}
                                            setVoicePrompt={setVoicePrompt}
                                            setAudioDuration={setAudioDuration}
                                        />
                                    )}
                                    {!voiceType && (
                                        <div className="text-sm text-muted flex items-center gap-2">
                                            <span>💡</span> Select a voice and generate a script to enable audio generation.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card-ai-glass p-6 space-y-6">
                                <FormField
                                    control={form.control}
                                    name="language"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold ai-glow-text">Language</FormLabel>
                                            <FormControl>
                                                <select {...field} className="form-input-dark">
                                                    <option value="">Select language</option>
                                                    {languageOptions.map(lang => (
                                                        <option key={lang} value={lang} className="text-white-1 bg-black-2">{lang}</option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold ai-glow-text">Tags</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. AI, Technology, News" className="form-input-dark" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={uploading} className="btn-ai-neon px-8 py-3">
                                    {uploading ? 'Processing...' : editing ? 'Save Changes' : 'Add Episode'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Playlist Selector Modal */}
            {playlistEpisodeId && (
                <PlaylistSelectorModal
                    open={playlistModalOpen}
                    onOpenChange={setPlaylistModalOpen}
                    itemType="episode"
                    itemId={playlistEpisodeId}
                />
            )}
        </div>
    );
}