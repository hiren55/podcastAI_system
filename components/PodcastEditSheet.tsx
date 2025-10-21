import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from './ui/use-toast';

const languageOptions = [
    'English', 'Hindi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese', 'Urdu', 'Other'
];

const formSchema = z.object({
    podcastTitle: z.string().min(2, 'Title is required'),
    podcastDescription: z.string().min(2, 'Description is required'),
    imageUrl: z.string().url('Enter a valid image URL'),
    tags: z.string().optional(), // comma-separated
    language: z.string().optional(),
});

export default function PodcastEditSheet({
    open,
    onOpenChange,
    podcast,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    podcast: {
        podcastId: string;
        podcastTitle: string;
        podcastDescription: string;
        imageUrl: string;
        tags?: string[];
        language?: string;
    };
    onSuccess?: () => void;
}) {
    const { toast } = useToast();
    const editPodcast = useMutation(api.podcasts.editPodcast);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            podcastTitle: podcast.podcastTitle || '',
            podcastDescription: podcast.podcastDescription || '',
            imageUrl: podcast.imageUrl || '',
            tags: podcast.tags?.join(', ') || '',
            language: podcast.language || '',
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await editPodcast({
                podcastId: podcast.podcastId,
                podcastTitle: data.podcastTitle,
                podcastDescription: data.podcastDescription,
                imageUrl: data.imageUrl,
                tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                language: data.language,
            });
            toast({ title: 'Podcast updated!' });
            setIsSubmitting(false);
            onOpenChange(false);
            onSuccess && onSuccess();
        } catch (err) {
            toast({ title: 'Error updating podcast', variant: 'destructive' });
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-black-1 border-glass">
                <DialogHeader className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                            <span className="text-xl">✏️</span>
                        </div>
                        <DialogTitle className="text-2xl font-bold ai-gradient-text">Edit Podcast</DialogTitle>
                    </div>
                    <p className="text-tertiary">Update your podcast details with AI-powered features</p>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="card-ai-glass p-6 space-y-6">
                            <FormField
                                control={form.control}
                                name="podcastTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold ai-glow-text">Title</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Podcast Title" className="form-input-dark" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="podcastDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold ai-glow-text">Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Podcast Description" className="form-textarea-dark" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold ai-glow-text">Thumbnail Image URL</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="https://..." className="form-input-dark" />
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
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting} className="btn-ai-neon px-8 py-3">
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}