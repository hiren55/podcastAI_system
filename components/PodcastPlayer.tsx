"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { formatTime } from "@/lib/formatTime";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";

import { Progress } from "./ui/progress";

const PodcastPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const { audio, setAudio, currentTime, setCurrentTime } = useAudio();

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };

  const forward = () => {
    if (
      audioRef.current &&
      audioRef.current.currentTime &&
      audioRef.current.duration &&
      audioRef.current.currentTime + 5 < audioRef.current.duration
    ) {
      audioRef.current.currentTime += 5;
    }
  };

  const rewind = () => {
    if (audioRef.current && audioRef.current.currentTime - 5 > 0) {
      audioRef.current.currentTime -= 5;
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const updateCurrentTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener("timeupdate", updateCurrentTime);
      audioElement.addEventListener("play", handlePlay);
      audioElement.addEventListener("pause", handlePause);

      return () => {
        audioElement.removeEventListener("timeupdate", updateCurrentTime);
        audioElement.removeEventListener("play", handlePlay);
        audioElement.removeEventListener("pause", handlePause);
      };
    }
  }, [setCurrentTime]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audio?.audioUrl) {
      if (audioElement) {
        audioElement.src = audio.audioUrl;
        audioElement.load();
        if (audio.currentTime) {
          audioElement.currentTime = audio.currentTime;
        }
        audioElement.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Error auto-playing audio:', error);
          setIsPlaying(false);
        });
      }
    } else {
      audioElement?.pause();
      setIsPlaying(false);
    }
  }, [audio]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lastPlayedAudio');
      localStorage.removeItem('lastPlayedTime');
    }
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setAudio(undefined);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lastPlayedAudio');
      localStorage.removeItem('lastPlayedTime');
    }
  };

  return (
    <div
      className={cn("sticky bottom-0 left-0 flex size-full flex-col z-50", {
        hidden: !audio?.audioUrl || audio?.audioUrl === "",
      })}
    >
      {/* Custom Progress Bar */}
      <div className="relative w-full h-1 bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
        </div>
      </div>

      {/* Enhanced Player Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 flex h-[120px] w-full items-center justify-between px-6 max-md:px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-2 left-1/4 w-20 h-20 bg-blue-500/10 rounded-full blur-lg animate-pulse"></div>
          <div className="absolute bottom-2 right-1/3 w-16 h-16 bg-purple-500/10 rounded-full blur-md animate-pulse delay-1000"></div>
        </div>

        <audio
          ref={audioRef}
          src={audio?.audioUrl}
          className="hidden"
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />

        {/* Podcast Info Section */}
        <div className="relative z-10 flex items-center gap-4 max-md:hidden">
          <Link href={`/podcast/${audio?.podcastId}`} className="group">
            <div className="relative">
              <Image
                src={audio?.imageUrl! || "/images/player1.png"}
                width={72}
                height={72}
                alt="player1"
                className="aspect-square rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 rounded-xl bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
          <div className="flex flex-col gap-1">
            {audio?.playlistName && (
              <p className="text-xs text-gray-500">Playlist: {audio.playlistName}</p>
            )}
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate max-w-[200px]">
              {audio?.episodeTitle || audio?.podcastTitle || audio?.title}
            </h2>
            <p className="text-sm text-gray-400">{audio?.author}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Currently Playing</span>
            </div>
          </div>
        </div>

        {/* Mobile Podcast Info */}
        <div className="relative z-10 flex items-center gap-3 md:hidden">
          <Image
            src={audio?.imageUrl! || "/images/player1.png"}
            width={48}
            height={48}
            alt="player1"
            className="aspect-square rounded-lg shadow-lg"
          />
          <div className="flex flex-col">
            {audio?.playlistName && (
              <p className="text-xs text-gray-500">Playlist: {audio.playlistName}</p>
            )}
            <h2 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate max-w-[150px]">
              {audio?.episodeTitle || audio?.podcastTitle || audio?.title}
            </h2>
            <p className="text-xs text-gray-400">{audio?.author}</p>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="relative z-10 flex items-center gap-4 md:gap-6">
          {/* Rewind Button */}
          <div className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/50 transition-all duration-300 cursor-pointer group-hover:scale-110" onClick={rewind}>
              <Image
                src={"/icons/reverse.svg"}
                width={18}
                height={18}
                alt="rewind"
                className="filter brightness-0 invert group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-xs text-gray-400 font-medium">-5s</span>
          </div>

          {/* Play/Pause Button */}
          <div className="relative">
            <div
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked!');
                togglePlayPause();
              }}
            >
              <Image
                src={isPlaying ? "/icons/Pause.svg" : "/icons/Play.svg"}
                width={24}
                height={24}
                alt="play"
                className="filter brightness-0 invert hover:scale-110 transition-transform duration-300"
              />
            </div>
            {isPlaying && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 blur-md animate-pulse"></div>
            )}
          </div>

          {/* Forward Button */}
          <div className="flex items-center gap-2 group">
            <span className="text-xs text-gray-400 font-medium">+5s</span>
            <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/50 transition-all duration-300 cursor-pointer group-hover:scale-110" onClick={forward}>
              <Image
                src={"/icons/forward.svg"}
                width={18}
                height={18}
                alt="forward"
                className="filter brightness-0 invert group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* Time and Mute Controls */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-mono">{formatTime(currentTime)}</span>
            <span className="text-xs text-gray-500">/</span>
            <span className="text-sm text-gray-400 font-mono">{formatTime(duration)}</span>
          </div>

          <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/50 transition-all duration-300 cursor-pointer group-hover:scale-110" onClick={toggleMute}>
            <Image
              src={isMuted ? "/icons/unmute.svg" : "/icons/mute.svg"}
              width={18}
              height={18}
              alt="mute unmute"
              className="filter brightness-0 invert group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          {/* Close Button */}
          <div className="w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-600/80 transition-all duration-300 cursor-pointer hover:scale-110" onClick={closePlayer}>
            <span className="text-white font-bold text-lg">×</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PodcastPlayer;
