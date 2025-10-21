import { useRef, useState } from 'react';
import { Button } from './ui/button'
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { GenerateThumbnailProps } from '@/types';
import { Loader } from 'lucide-react';
import { Input } from './ui/input';
import Image from 'next/image';
import { useToast } from './ui/use-toast';
import { useAction, useMutation } from 'convex/react';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import { api } from '@/convex/_generated/api';
import { v4 as uuidv4 } from 'uuid';

const GenerateThumbnail = ({ setImage, setImageStorageId, image, imagePrompt, setImagePrompt }: GenerateThumbnailProps) => {
  const [isAiThumbnail, setIsAiThumbnail] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl)
  const getImageUrl = useMutation(api.podcasts.getUrl);
  const handleGenerateThumbnail = useAction(api.openai.generateThumbnailAction)

  const handleImage = async (blob: Blob, fileName: string) => {
    setIsImageLoading(true);
    setImage('');

    try {
      const file = new File([blob], fileName, { type: 'image/png' });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setImageStorageId(storageId);

      const imageUrl = await getImageUrl({ storageId });
      setImage(imageUrl!);
      setIsImageLoading(false);
      toast({
        title: "Thumbnail generated successfully",
      })
    } catch (error) {
      console.log(error)
      toast({ title: 'Error generating thumbnail', variant: 'destructive' })
    }
  }

  const generateImage = async () => {
    try {
      const response = await handleGenerateThumbnail({ prompt: imagePrompt });
      const blob = new Blob([response], { type: 'image/png' });
      handleImage(blob, `thumbnail-${uuidv4()}`);
    } catch (error) {
      console.log(error)
      toast({ title: 'Error generating thumbnail', variant: 'destructive' })
    }
  }
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    try {
      const files = e.target.files;
      if (!files) return;
      const file = files[0];
      const blob = await file.arrayBuffer()
        .then((ab) => new Blob([ab]));

      handleImage(blob, file.name);
    } catch (error) {
      console.log(error)
      toast({ title: 'Error uploading image', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Podcast Thumbnail</h3>
        <p className="text-slate-600">Create a stunning thumbnail for your podcast</p>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          type="button"
          variant={isAiThumbnail ? "gradientAccent" : "outline"}
          onClick={() => setIsAiThumbnail(true)}
          className="px-6 py-3 font-semibold rounded-xl transition-all duration-300"
        >
          <div className="flex items-center gap-2">
            <span>🤖</span>
            <span>AI Generate</span>
          </div>
        </Button>
        <Button
          type="button"
          variant={!isAiThumbnail ? "gradientAccent" : "outline"}
          onClick={() => setIsAiThumbnail(false)}
          className="px-6 py-3 font-semibold rounded-xl transition-all duration-300"
        >
          <div className="flex items-center gap-2">
            <span>📁</span>
            <span>Upload Image</span>
          </div>
        </Button>
      </div>

      {isAiThumbnail ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="block text-sm font-semibold text-slate-700">
              AI Prompt for Thumbnail Generation
            </Label>
            <Textarea
              className="form-textarea-white w-full"
              placeholder='Describe the thumbnail you want to generate...'
              rows={5}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
            />
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="gradientAccent"
              className="px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={generateImage}
              disabled={isImageLoading || !imagePrompt.trim()}
            >
              {isImageLoading ? (
                <div className="flex items-center gap-2">
                  <Loader size={20} className="animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>🎨</span>
                  <span>Generate Thumbnail</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
          onClick={() => imageRef?.current?.click()}
        >
          <Input
            type="file"
            className="hidden"
            ref={imageRef}
            onChange={(e) => uploadImage(e)}
            accept="image/*"
          />
          {!isImageLoading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Image src="/icons/upload-image.svg" width={32} height={32} alt="upload" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Click to upload</h3>
                <p className="text-sm text-slate-600">SVG, PNG, JPG, or GIF (max. 1080x1080px)</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Loader size={24} className="animate-spin text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Uploading...</h3>
                <p className="text-sm text-slate-600">Please wait while we process your image</p>
              </div>
            </div>
          )}
        </div>
      )}

      {image && (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-slate-800 mb-2">Generated Thumbnail</h4>
            <p className="text-sm text-slate-600">Preview of your podcast thumbnail</p>
          </div>
          <div className="flex justify-center">
            <div className="relative group">
              <Image
                src={image}
                width={300}
                height={300}
                className="rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                alt="thumbnail"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                  Click to view full size
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GenerateThumbnail