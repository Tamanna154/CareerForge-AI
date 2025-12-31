import { useState, useRef, useCallback } from 'react';

interface UseTextToSpeechProps {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

export function useTextToSpeech({
  rate = 1,
  pitch = 1,
  volume = 1,
  voice: preferredVoice
}: UseTextToSpeechProps = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    if (preferredVoice) {
      const found = voices.find(v => v.name.includes(preferredVoice));
      if (found) return found;
    }
    // Prefer English voices
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
    return englishVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }, [preferredVoice]);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      
      // Get voice after a small delay to ensure voices are loaded
      setTimeout(() => {
        const selectedVoice = getVoice();
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }, 100);

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        setIsPaused(false);
        if (event.error !== 'interrupted') {
          console.error('Speech synthesis error:', event.error);
          reject(new Error(event.error));
        } else {
          resolve();
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, [rate, pitch, volume, getVoice]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
}
