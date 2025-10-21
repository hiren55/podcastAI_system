import { GeneratePodcastProps } from '@/types'
import React, { useState } from 'react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Loader } from 'lucide-react'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/components/ui/use-toast"

import { useUploadFiles } from '@xixixao/uploadstuff/react';

const useGeneratePodcast = ({
  setAudio, voiceType, voicePrompt, setAudioStorageId
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast()

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl)

  const getPodcastAudio = useAction(api.openai.generateAudioAction)

  const getAudioUrl = useMutation(api.podcasts.getUrl);

  const generatePodcast = async () => {
    setIsGenerating(true);
    setAudio('');

    if (!voicePrompt) {
      toast({
        title: "Please provide a voiceType to generate a podcast",
      })
      return setIsGenerating(false);
    }

    try {
      const response = await getPodcastAudio({
        voice: voiceType,
        input: voicePrompt
      })

      const blob = new Blob([response], { type: 'audio/mpeg' });
      const fileName = `podcast-${uuidv4()}.mp3`;
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });
      setAudio(audioUrl!);
      setIsGenerating(false);
      toast({
        title: "Podcast generated successfully",
      })
    } catch (error) {
      console.log('Error generating podcast', error)
      toast({
        title: "Error creating a podcast",
        variant: 'destructive',
      })
      setIsGenerating(false);
    }

  }

  return { isGenerating, generatePodcast }
}

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast } = useGeneratePodcast(props);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">AI Voice Generation</h3>
        <p className="text-slate-600">Convert your script into natural-sounding audio</p>
      </div>

      <div className="space-y-4">
        <Label className="block text-sm font-semibold text-slate-700">
          Script for Voice Generation
        </Label>
        <Textarea
          className="form-textarea-white w-full"
          placeholder='Paste your script here to generate audio...'
          rows={6}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="gradientAccent"
          className="px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={generatePodcast}
          disabled={isGenerating || !props.voicePrompt.trim()}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Loader size={20} className="animate-spin" />
              <span>Generating Audio...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>🎵</span>
              <span>Generate Audio</span>
            </div>
          )}
        </Button>
      </div>

      {props.audio && (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-slate-800 mb-2">Generated Audio</h4>
            <p className="text-sm text-slate-600">Click play to listen to your generated podcast</p>
          </div>
          <div className="flex justify-center">
            <audio
              controls
              src={props.audio}
              autoPlay
              className="w-full max-w-md rounded-lg shadow-lg"
              onLoadedMetadata={(e) => props.setAudioDuration(e.currentTarget.duration)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default GeneratePodcast