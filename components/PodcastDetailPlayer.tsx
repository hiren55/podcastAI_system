"use client";

import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { api } from "@/convex/_generated/api";
import { useAudio } from "@/providers/AudioProvider";

import { PodcastDetailPlayerProps } from "@/types";
import LoaderSpinner from "./LoaderSpinner";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import PodcastEditSheet from "./PodcastEditSheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { set } from "react-hook-form";

const PodcastDetailPlayer = ({
  audioUrl,
  podcastTitle,
  podcastDescription,
  author,
  imageUrl,
  podcastId,
  imageStorageId,
  audioStorageId,
  isOwner,
  authorImageUrl,
  authorId,
}: PodcastDetailPlayerProps) => {
  const router = useRouter();
  const { setAudio } = useAudio();
  const [isPodcastDeleting, setIsPodcastDeleting] = useState(false);
  const { toast } = useToast();
  const deletePodcast = useMutation(api.podcasts.deletePodcast);

  const [isEditing, setIsEditing] = useState(false);

  const handlePlay = () => {
    setAudio({
      title: podcastTitle,
      audioUrl,
      imageUrl,
      author,
      podcastId,
    });
  };

  const handleDelete = async () => {
    try {
      await deletePodcast({ podcastId, imageStorageId, audioStorageId });
      toast({
        title: "Podcast deleted",
      });
      router.push("/");
    } catch (error) {
      console.error("Error deleting podcast", error);
      toast({
        title: "Error deleting podcast",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    router.push(`/podcasts/${podcastId}/update`);
  };

  return (
    <div className="mt-6 flex w-full justify-between max-md:justify-center">
      <div className="flex flex-col gap-8 max-md:items-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold tracking-[-0.36px] text-white-1">
            {podcastTitle}
          </h1>
          <figure className="flex items-center gap-2">
            <Image
              src={authorImageUrl!}
              width={20}
              height={20}
              alt="Caster icon"
              className="rounded-full"
            />
            <h2 className="text-16 font-normal text-white-3">{author}</h2>
          </figure>
        </div>

        <Button
          onClick={handlePlay}
          className="text-16 w-full max-w-[250px] bg-orange-1 font-extrabold text-white-1"
        >
          <Image
            src="/icons/Play.svg"
            width={20}
            height={20}
            alt="random play"
          />
          &nbsp; Play podcast
        </Button>
      </div>
      {isOwner && (
        <div className="relative mt-2 flex gap-2">
          <Button
            className="bg-black-6 text-16 font-medium text-white-1"
            onClick={() => setIsEditing(true)}
          >
            <Image
              src="/icons/edit.svg"
              width={20}
              height={20}
              alt="Edit icon"
            />
            &nbsp; Edit
          </Button>
          <PodcastEditSheet
            open={isEditing}
            onOpenChange={setIsEditing}
            podcastId={podcastId}
            imageUrl={imageUrl}
            podcastTitle={podcastTitle}
            podcastDescription={podcastDescription}
            onSuccess={() => {
              setIsEditing(false);
            }}
          />

          <Button
            className="bg-black-6 text-16 font-medium text-white-1"
            onClick={() => setIsPodcastDeleting((prev) => !prev)}
          >
            <Image
              src="/icons/delete.svg"
              width={20}
              height={20}
              alt="Delete icon"
            />
            &nbsp; {isPodcastDeleting ? "Cancel" : "Delete"}
          </Button>
          {isPodcastDeleting && (
            <div className="absolute -right-40 -top-20 z-10 flex w-80 flex-col gap-3 rounded-xl bg-black-6 p-6">
              <p className="text-center text-white-1">
                This action cannot be undone.
              </p>
              <Button
                className="bg-red-500 text-16 font-medium text-white-1"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PodcastDetailPlayer;