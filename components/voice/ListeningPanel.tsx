
import { executeVoiceCommand } from '../../utils/voiceCommands';
import React, { useEffect, useRef, useState } from 'react';
import {
  MicIcon,
  MicOffIcon,
  SquareIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Waveform } from './WaveForm';
import { useSession } from '../../contexts/SessionContext';

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

type CommandStatusEvent = CustomEvent<{
  message: string;
}>;

export function ListeningPanel() {
  const { micState, retryMic } = useSession();

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldListenRef = useRef(false);

  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [message, setMessage] = useState(
    'Start listening and speak naturally.',
  );

  const unavailable = micState === 'unavailable';

  // Display the actual response received from the extension.
  useEffect(() => {
    const handleCommandStatus = (event: Event) => {
      const customEvent = event as CommandStatusEvent;
      const responseMessage = customEvent.detail?.message;

      if (responseMessage) {
        setMessage(responseMessage);
      }
    };

    window.addEventListener(
      'handsfree-command-status',
      handleCommandStatus,
    );

    return () => {
      window.removeEventListener(
        'handsfree-command-status',
        handleCommandStatus,
      );
    };
  }, []);

  useEffect(() => {
    const speechWindow = window as SpeechWindow;

    const SpeechRecognitionConstructor =
      speechWindow.SpeechRecognition ??
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setSupported(false);
      setMessage(
        'Speech recognition is not supported in this browser. Try the latest version of Google Chrome.',
      );
      return;
    }

    const recognition = new SpeechRecognitionConstructor();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setListening(true);
      setMessage('Listening. Speak a command.');
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';

        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      if (finalText.trim()) {
        const spokenText = finalText.trim();

        setTranscript((previous) =>
          `${previous} ${spokenText}`.trim(),
        );

        const commands = spokenText
          .split(/[.!?]+/)
          .map((command) => command.trim())
          .filter(Boolean);

        for (const command of commands) {
          if (/^stop listening$/i.test(command)) {
            shouldListenRef.current = false;
            recognitionRef.current?.stop();
            setListening(false);
            setMessage('Voice listening stopped.');
            break;
          }

          const result = executeVoiceCommand(command);
          setMessage(result.message);
        }
      }

      setInterimTranscript(interimText.trim());
    };

    recognition.onerror = (event) => {
      shouldListenRef.current = false;
      setListening(false);

      const errorMessages: Record<string, string> = {
        'not-allowed':
          'Microphone access was denied. Allow microphone access in Chrome site settings.',
        'audio-capture':
          'No microphone was detected. Connect a microphone and try again.',
        network:
          'Speech recognition encountered a network error. Check your connection and try again.',
        'no-speech':
          'No speech was detected. Click Start Listening to try again.',
        'service-not-allowed':
          'The browser speech recognition service is unavailable.',
      };

      setMessage(
        errorMessages[event.error] ??
          `Speech recognition stopped (${event.error}). Try again.`,
      );
    };

    recognition.onend = () => {
      setListening(false);

      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch {
          shouldListenRef.current = false;
          setMessage('Could not restart speech recognition. Try again.');
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = () => {
    const recognition = recognitionRef.current;

    if (!supported || !recognition) {
      setMessage('Speech recognition is not available in this browser.');
      return;
    }

    if (unavailable) {
      retryMic();
      setMessage(
        'Microphone status needs to be reinitialized. Refresh the page and allow microphone access if prompted.',
      );
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    shouldListenRef.current = true;

    try {
      recognition.start();
      setMessage('Starting microphone...');
    } catch {
      shouldListenRef.current = false;
      setMessage(
        'Could not start speech recognition. If it is already running, stop it and try again.',
      );
    }
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
    setInterimTranscript('');
    setMessage('Listening stopped.');
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setMessage('Transcript cleared. You can continue listening.');
  };

  return (
    <section
      aria-labelledby="listening-heading"
      className="luminous relative overflow-hidden rounded-4xl bg-ink-2 p-6 shadow-panel sm:p-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(155,92,255,0.22),transparent_55%)]"
      />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative grid h-32 w-32 shrink-0 place-items-center">
            {listening && (
              <>
                <span
                  className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-cyan/50"
                  aria-hidden="true"
                />
                <span
                  className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-violet/50 [animation-delay:1.1s]"
                  aria-hidden="true"
                />
              </>
            )}

            <span
              className={`grid h-28 w-28 place-items-center rounded-full transition-[background-color,box-shadow] duration-200 ${
                !supported || unavailable
                  ? 'bg-coral/15 text-coral ring-2 ring-coral/50'
                  : listening
                    ? 'bg-[linear-gradient(135deg,#31D7FF,#9B5CFF)] text-white shadow-glow-violet'
                    : 'bg-ink-3 text-muted ring-1 ring-line'
              }`}
            >
              {!supported || unavailable ? (
                <MicOffIcon className="h-11 w-11" aria-hidden="true" />
              ) : (
                <MicIcon className="h-11 w-11" aria-hidden="true" />
              )}
            </span>
          </div>

          <div className="flex-1">
            <h2
              id="listening-heading"
              className="font-display text-2xl font-semibold"
            >
              {!supported
                ? 'Speech recognition unavailable'
                : unavailable
                  ? 'Microphone needs attention'
                  : listening
                    ? 'Listening...'
                    : 'Microphone is ready'}
            </h2>

            <p className="mt-1.5 text-muted" role="status" aria-live="polite">
              {message}
            </p>

            {listening && <Waveform active={listening} />}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={listening ? stopListening : startListening}
            disabled={!supported}
          >
            {listening ? (
              <>
                <SquareIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                Stop Listening
              </>
            ) : (
              <>
                <MicIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                Start Listening
              </>
            )}
          </Button>

          <Button
            onClick={clearTranscript}
            disabled={!transcript && !interimTranscript}
          >
            <RefreshCwIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Clear Transcript
          </Button>
        </div>

        <div className="rounded-2xl border border-line bg-ink-3/60 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-semibold">Recognized speech</h3>
            <span className="text-xs text-muted">
              {listening ? 'Live transcription' : 'Transcript'}
            </span>
          </div>

          <p className="min-h-16 whitespace-pre-wrap break-words leading-7">
            {transcript || interimTranscript ? (
              <>
                {transcript}
                {transcript && interimTranscript ? ' ' : ''}
                <span className="text-muted">{interimTranscript}</span>
              </>
            ) : (
              <span className="text-muted">
                Your recognized words will appear here when you speak.
              </span>
            )}
          </p>
        </div>

        <p className="text-xs text-muted">
          Speak supported commands to control the website saved by the
          HANDSFREE extension. Browser actions require the extension to be
          installed, enabled, and connected.
        </p>
      </div>
    </section>
  );
}
