'use client';

import { AudioContextType, AudioProps } from "@/types";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [audio, setAudio] = useState<AudioProps | undefined>();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const pathname = usePathname();

  const playAudio = (newAudio: AudioProps) => {
    setAudio(newAudio);
    setCurrentTime(newAudio.currentTime || 0);
  };

  useEffect(() => {
    if (pathname === '/create-podcast') setAudio(undefined);
  }, [pathname]);

  // Load saved audio state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAudio = localStorage.getItem('lastPlayedAudio');
      const savedTime = localStorage.getItem('lastPlayedTime');
      if (savedAudio) {
        const parsedAudio: AudioProps = JSON.parse(savedAudio);
        setAudio(parsedAudio);
        if (savedTime) {
          setCurrentTime(parseFloat(savedTime));
        }
      }
    }
  }, []);

  // Save audio state to localStorage whenever audio or currentTime changes
  useEffect(() => {
    if (typeof window !== 'undefined' && audio) {
      localStorage.setItem('lastPlayedAudio', JSON.stringify(audio));
      localStorage.setItem('lastPlayedTime', currentTime.toString());
    } else if (typeof window !== 'undefined' && !audio) {
      // Clear localStorage if audio is undefined (e.g., player closed)
      localStorage.removeItem('lastPlayedAudio');
      localStorage.removeItem('lastPlayedTime');
    }
  }, [audio, currentTime]);

  return (
    <AudioContext.Provider value={{ audio, setAudio, playAudio, currentTime, setCurrentTime }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);

  if (!context) throw new Error('useAudio must be used within an AudioProvider');

  return context;
};

export default AudioProvider;