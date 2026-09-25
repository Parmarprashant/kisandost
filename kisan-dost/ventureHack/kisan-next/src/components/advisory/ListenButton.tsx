'use client';

import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2, Play, Square, RotateCcw } from 'lucide-react';
import { IndicLanguageCode } from '@/lib/tts/ttsConfig';

export type ListenButtonState = 'idle' | 'generating' | 'playing' | 'retry' | 'unavailable';

export interface ListenButtonProps {
  text: string;
  language: IndicLanguageCode;
  stylePreset?: 'CALM' | 'FORMAL' | 'URGENT';
  sourceNotificationId?: string;
  className?: string;
}

export function ListenButton({
  text,
  language,
  stylePreset = 'CALM',
  sourceNotificationId,
  className = ''
}: ListenButtonProps) {
  const [state, setState] = useState<ListenButtonState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrl = useRef<string | null>(null);

  const labels = {
    'hi-IN': {
      idle: 'आवाज में सुनें',
      generating: 'ऑडियो तैयार हो रहा है...',
      playing: 'चल रहा है (रोकें)',
      retry: 'पुनः प्रयास करें',
      unavailable: 'आवाज अनुपलब्ध'
    },
    'gu-IN': {
      idle: 'અવાજમાં સાંભળો',
      generating: 'ઓડિયો તૈયાર થઈ રહ્યો છે...',
      playing: 'વાગી રહ્યું છે (રોકો)',
      retry: 'ફરી પ્રયાસ કરો',
      unavailable: 'અવાજ અનુપલબ્ધ'
    },
    'mr-IN': {
      idle: 'आवाजात ऐका',
      generating: 'ऑडिओ तयार होत आहे...',
      playing: 'सुरू आहे (थांबवा)',
      retry: 'पुन्हा प्रयत्न करा',
      unavailable: 'आवाज अनुपलब्ध'
    }
  }[language] || {
    idle: 'Listen',
    generating: 'Generating audio...',
    playing: 'Playing (Stop)',
    retry: 'Retry',
    unavailable: 'Audio Unavailable'
  };

  const handleTogglePlay = async () => {
    // If playing, pause and reset
    if (state === 'playing' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState('idle');
      return;
    }

    // If audio is already synthesized and cached in memory
    if (currentAudioUrl.current) {
      playAudio(currentAudioUrl.current);
      return;
    }

    // Generate audio from Vexyl-TTS API
    setState('generating');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/notifications/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language,
          style: stylePreset,
          sourceNotificationId
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.audioUrl) {
        setState('unavailable');
        setErrorMessage(data.error || 'TTS service unavailable');
        return;
      }

      currentAudioUrl.current = data.audioUrl;
      playAudio(data.audioUrl);
    } catch (err: any) {
      setState('retry');
      setErrorMessage(err.message || 'Failed to connect to voice engine');
    }
  };

  const playAudio = (url: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setState('idle');
      audioRef.current.onerror = () => {
        setState('retry');
        setErrorMessage('Playback error');
      };
    }
    audioRef.current.src = url;
    audioRef.current.play()
      .then(() => setState('playing'))
      .catch((e) => {
        setState('retry');
        setErrorMessage(e.message || 'Playback blocked');
      });
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={state === 'generating'}
        aria-label={labels[state]}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
          state === 'playing'
            ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
            : state === 'generating'
            ? 'bg-emerald-700/60 text-emerald-100 cursor-wait'
            : state === 'retry'
            ? 'bg-rose-600 hover:bg-rose-700 text-white'
            : state === 'unavailable'
            ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
        }`}
      >
        {state === 'generating' && <Loader2 className="w-4 h-4 animate-spin" />}
        {state === 'playing' && <Square className="w-4 h-4 fill-current" />}
        {state === 'idle' && <Volume2 className="w-4 h-4" />}
        {state === 'retry' && <RotateCcw className="w-4 h-4" />}
        {state === 'unavailable' && <VolumeX className="w-4 h-4" />}
        <span>{labels[state]}</span>
      </button>

      {errorMessage && state !== 'playing' && (
        <span className="text-xs text-rose-400" title={errorMessage}>
          ({errorMessage})
        </span>
      )}
    </div>
  );
}
