"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import GeneratePodcast from "@/components/GeneratePodcast"
import GenerateThumbnail from "@/components/GenerateThumbnail"
import { Loader } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { useToast } from "@/components/ui/use-toast"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import KeywordToPodcast from '@/components/KeywordToPodcast';
import { useUser } from '@clerk/nextjs'

const voiceCategories = ['alloy', 'shimmer', 'nova', 'echo', 'fable', 'onyx'];

const formSchema = z.object({
  podcastTitle: z.string().min(2),
  podcastDescription: z.string().min(2),
})

const CreatePodcast = () => {
  const router = useRouter()
  const { user } = useUser();
  const role = useQuery(api.users.getUserRole, user?.id ? { clerkId: user.id } : 'skip');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null)
  const [imageUrl, setImageUrl] = useState('');

  const [audioUrl, setAudioUrl] = useState('');
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(null)
  const [audioDuration, setAudioDuration] = useState(0);

  const [voiceType, setVoiceType] = useState<string | null>(null);
  const [voicePrompt, setVoicePrompt] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPodcast = useMutation(api.podcasts.createPodcast)

  const { toast } = useToast()
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  })

  useEffect(() => {
    if (role === 'viewer') {
      toast({ title: 'Creator access required to create podcasts', variant: 'destructive' });
      router.replace('/');
    }
  }, [role, router, toast]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // Check if user is authenticated
      if (!user) {
        toast({
          title: 'Please sign in to create a podcast',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      if (!audioUrl || !imageUrl || !voiceType) {
        toast({
          title: 'Please generate audio and image',
        })
        setIsSubmitting(false);
        throw new Error('Please generate audio and image')
      }

      const podcast = await createPodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl,
        voiceType,
        imagePrompt,
        voicePrompt,
        views: 0,
        audioDuration,
        audioStorageId: audioStorageId!,
        imageStorageId: imageStorageId!,
        clerkId: user.id, // Pass the Clerk user ID
      })
      toast({ title: 'Podcast created' })
      setIsSubmitting(false);
      router.push('/')
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        variant: 'destructive',
      })
      setIsSubmitting(false);
    }
  }

  // Show loading while checking authentication and role
  if (!user || role === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }


  if (role === 'viewer') return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Gradient Orbs */}
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      <div className="floating-orb floating-orb-3"></div>

      <div className="max-w-5xl mx-auto space-y-8 p-8 relative z-10">
        {/* Header Section */}
        <div className="card-ai-glass p-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-6 to-gray-5 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">🎙️</span>
            </div>
            <h1 className="text-4xl font-bold ai-gradient-text mb-4">Create New Podcast</h1>
            <p className="text-xl text-tertiary">Complete the fields below to create your podcast with AI-powered features</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="card-ai-glass p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-6 to-gray-5 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <h2 className="text-3xl font-bold ai-glow-text mb-3">Basic Information</h2>
                <p className="text-tertiary text-lg">Tell us about your podcast</p>
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="podcastTitle"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-semibold ai-glow-text">Podcast Title *</FormLabel>
                      <FormControl>
                        <input
                          className="form-input-dark w-full"
                          placeholder="JSM Pro Podcast"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Label className="block text-sm font-semibold ai-glow-text">Select AI Voice *</Label>
                  <Select onValueChange={(value) => setVoiceType(value)}>
                    <SelectTrigger className="form-input-dark w-full">
                      <SelectValue placeholder="Select AI Voice" />
                    </SelectTrigger>
                    <SelectContent className="bg-black-2 border-glass shadow-xl rounded-lg">
                      {voiceCategories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="capitalize text-white-1 hover:bg-black-3 focus:bg-black-3 cursor-pointer"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    {voiceType && (
                      <audio
                        src={`/${voiceType}.mp3`}
                        autoPlay
                        className="hidden"
                      />
                    )}
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="podcastDescription"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-semibold ai-glow-text">Description *</FormLabel>
                      <FormControl>
                        <textarea
                          className="form-textarea-dark w-full"
                          placeholder="Write a short podcast description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* AI Generation Section */}
            <div className="card-ai-glass p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-6 to-gray-5 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">🤖</span>
                </div>
                <h2 className="text-4xl font-bold ai-gradient-text mb-4">AI Generation</h2>
                <p className="text-xl text-tertiary max-w-3xl mx-auto leading-relaxed">
                  Let our advanced AI create your podcast content with intelligent script generation,
                  voice synthesis, and stunning thumbnail creation
                </p>
              </div>

              <div className="space-y-8">
                {/* AI Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black-2 to-black-3 border border-glass">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                      <span className="text-2xl">✍️</span>
                    </div>
                    <h3 className="font-semibold ai-glow-text mb-2">Smart Scripts</h3>
                    <p className="text-sm text-tertiary">AI-powered content generation</p>
                  </div>

                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black-2 to-black-3 border border-glass">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                      <span className="text-2xl">🎵</span>
                    </div>
                    <h3 className="font-semibold ai-glow-text mb-2">Voice Synthesis</h3>
                    <p className="text-sm text-tertiary">Natural AI voice generation</p>
                  </div>

                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black-2 to-black-3 border border-glass">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                      <span className="text-2xl">🖼️</span>
                    </div>
                    <h3 className="font-semibold ai-glow-text mb-2">AI Thumbnails</h3>
                    <p className="text-sm text-tertiary">Custom visual creation</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <KeywordToPodcast onUseScript={(s) => setVoicePrompt(s)} onUseThumbPrompt={(p) => setImagePrompt(p)} />

                  <GeneratePodcast
                    setAudioStorageId={setAudioStorageId}
                    setAudio={setAudioUrl}
                    voiceType={voiceType!}
                    audio={audioUrl}
                    voicePrompt={voicePrompt}
                    setVoicePrompt={setVoicePrompt}
                    setAudioDuration={setAudioDuration}
                  />

                  <GenerateThumbnail
                    setImage={setImageUrl}
                    setImageStorageId={setImageStorageId}
                    image={imageUrl}
                    imagePrompt={imagePrompt}
                    setImagePrompt={setImagePrompt}
                  />
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="card-ai-glass p-8">
              <div className="flex flex-col items-center space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold ai-gradient-text mb-4">Ready to Publish?</h3>
                  <p className="text-tertiary text-xl">Click the button below to submit and publish your podcast</p>
                </div>

                <Button
                  type="submit"
                  className="btn-ai-neon text-lg w-full max-w-md py-4 font-bold rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <Loader size={20} className="animate-spin" />
                      <span>Publishing Podcast...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>🚀</span>
                      <span>Submit & Publish Podcast</span>
                    </div>
                  )}
                </Button>

                {isSubmitting && (
                  <div className="status-indicator status-generating">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    AI is working on your podcast...
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default CreatePodcast