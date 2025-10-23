
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Voice } from './types';
import { LANGUAGES, ACCENTS, SPEECH_TYPES, VOICES } from './constants';
import { PlayIcon, PauseIcon, LoadingSpinner } from './components/Icons';
import { generateSpeech, detectSpeechType } from './services/geminiService';
import { playBase64Audio } from './services/audioService';

const VoiceCard: React.FC<{
  voice: Voice;
  isSelected: boolean;
  onSelect: (voiceId: string) => void;
  onPreview: (voice: Voice) => void;
  isPreviewing: boolean;
  isPreviewLoading: boolean;
}> = ({ voice, isSelected, onSelect, onPreview, isPreviewing, isPreviewLoading }) => {
  return (
    <div
      className={`bg-brand-surface border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
        isSelected ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-brand-border hover:border-brand-primary/50'
      }`}
      onClick={() => onSelect(voice.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-brand-text-primary">{voice.name}</h3>
          <p className="text-sm text-brand-text-secondary">{voice.gender}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(voice);
          }}
          disabled={isPreviewLoading}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
        >
          {isPreviewLoading ? (
            <LoadingSpinner className="w-5 h-5" />
          ) : isPreviewing ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-sm text-brand-text-secondary mt-2">{voice.description}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [text, setText] = useState('Hello world! Welcome to the Gemini Text to Speech studio. Here you can generate natural sounding audio in a variety of languages and voices.');
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0].id);
  const [selectedSpeechType, setSelectedSpeechType] = useState(SPEECH_TYPES[0].id);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewState, setPreviewState] = useState<{ id: string, status: 'loading' | 'playing' } | null>(null);
  const [mainAudioState, setMainAudioState] = useState<'playing' | 'stopped'>('stopped');
  const [error, setError] = useState<string | null>(null);

  const previewAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const mainAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const autoDetectTimeoutRef = useRef<number | null>(null);

  const availableAccents = useMemo(() => {
    return ACCENTS.filter((a) => a.languageId === selectedLanguage);
  }, [selectedLanguage]);

  const filteredVoices = useMemo(() => {
    const langAccentTag = `${selectedLanguage}-${selectedAccent}`;
    return VOICES.filter(voice => 
      voice.tags.includes(langAccentTag) && voice.tags.includes(selectedSpeechType)
    );
  }, [selectedLanguage, selectedAccent, selectedSpeechType]);
  
  useEffect(() => {
    if (availableAccents.length > 0 && !availableAccents.some(a => a.id === selectedAccent)) {
      setSelectedAccent(availableAccents[0].id);
    }
  }, [availableAccents, selectedAccent]);
  
  useEffect(() => {
    if (filteredVoices.length > 0 && !filteredVoices.some(v => v.id === selectedVoice)) {
      setSelectedVoice(filteredVoices[0].id);
    } else if (filteredVoices.length === 0) {
      setSelectedVoice(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredVoices]);

  useEffect(() => {
    if (autoDetectTimeoutRef.current) {
        window.clearTimeout(autoDetectTimeoutRef.current);
    }
    if (text.trim().length > 20) {
        autoDetectTimeoutRef.current = window.setTimeout(() => {
            detectSpeechType(text).then(type => {
                setSelectedSpeechType(type);
            });
        }, 1500);
    }
    return () => {
        if (autoDetectTimeoutRef.current) {
            window.clearTimeout(autoDetectTimeoutRef.current);
        }
    };
  }, [text]);

  const stopAllAudio = useCallback(() => {
    previewAudioSourceRef.current?.stop();
    previewAudioSourceRef.current = null;
    setPreviewState(null);
    mainAudioSourceRef.current?.stop();
    mainAudioSourceRef.current = null;
    setMainAudioState('stopped');
  }, []);

  const handlePreview = useCallback(async (voice: Voice) => {
    if (previewState?.id === voice.id && previewState.status === 'playing') {
      stopAllAudio();
      return;
    }
    
    stopAllAudio();
    setPreviewState({ id: voice.id, status: 'loading' });
    setError(null);
    
    try {
      const audioBase64 = await generateSpeech(voice.previewText, voice.id);
      previewAudioSourceRef.current = await playBase64Audio(audioBase64);
      setPreviewState({ id: voice.id, status: 'playing' });
      previewAudioSourceRef.current.onended = () => {
        if (previewState?.id === voice.id) {
          setPreviewState(null);
        }
      };
    } catch (err) {
      console.error(err);
      setError("Failed to generate voice preview. Please try again.");
      setPreviewState(null);
    }
  }, [previewState, stopAllAudio]);

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return;
    stopAllAudio();
    setIsGenerating(true);
    setError(null);

    try {
      const audioBase64 = await generateSpeech(text, selectedVoice);
      mainAudioSourceRef.current = await playBase64Audio(audioBase64);
      setMainAudioState('playing');
      mainAudioSourceRef.current.onended = () => setMainAudioState('stopped');
    } catch (err) {
      console.error(err);
      setError("Failed to generate speech. Please check your connection and try again.");
      setMainAudioState('stopped');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-brand-text-primary">Gemini TTS Studio</h1>
        <p className="text-brand-text-secondary mt-2 max-w-2xl mx-auto">
          Craft natural-sounding speech with the power of Google's Gemini API.
        </p>
      </header>
      
      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-6 max-w-4xl mx-auto text-center">
          {error}
        </div>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Panel: Controls & Text Input */}
        <div className="bg-brand-surface rounded-xl p-6 flex flex-col gap-6 h-fit lg:sticky lg:top-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-brand-text-secondary mb-1">Language</label>
              <select id="language" value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary">
                {LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="accent" className="block text-sm font-medium text-brand-text-secondary mb-1">Accent / Region</label>
              <select id="accent" value={selectedAccent} onChange={e => setSelectedAccent(e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary">
                {availableAccents.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="speech-type" className="block text-sm font-medium text-brand-text-secondary mb-1">Speech Type (Auto-detected)</label>
            <select id="speech-type" value={selectedSpeechType} onChange={e => setSelectedSpeechType(e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary">
              {SPEECH_TYPES.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-brand-text-secondary mb-1">Text to Synthesize</label>
            <textarea
              id="text-input"
              rows={8}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter text here..."
              className="w-full bg-brand-bg border border-brand-border rounded-md p-3 text-brand-text-primary focus:ring-brand-primary focus:border-brand-primary resize-y"
            />
            <p className="text-xs text-brand-text-secondary mt-1 text-right">{text.length} characters</p>
          </div>
        </div>

        {/* Right Panel: Voice Selection */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Select a Voice</h2>
          {filteredVoices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredVoices.map(voice => (
                <VoiceCard 
                  key={voice.id}
                  voice={voice}
                  isSelected={selectedVoice === voice.id}
                  onSelect={setSelectedVoice}
                  onPreview={handlePreview}
                  isPreviewing={previewState?.id === voice.id && previewState.status === 'playing'}
                  isPreviewLoading={previewState?.id === voice.id && previewState.status === 'loading'}
                />
              ))}
            </div>
          ) : (
            <div className="bg-brand-surface rounded-lg p-8 text-center text-brand-text-secondary">
              <p>No voices match the current filter criteria.</p>
              <p className="text-sm mt-2">Try selecting a different language, accent, or speech type.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Sticky Footer for Action Button */}
      <footer className="sticky bottom-0 left-0 right-0 p-4 bg-brand-bg/80 backdrop-blur-sm mt-8 border-t border-brand-border">
          <div className="max-w-7xl mx-auto flex justify-center">
            <button
                onClick={mainAudioState === 'playing' ? stopAllAudio : handleGenerate}
                disabled={isGenerating || !selectedVoice}
                className="w-full md:w-auto min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold rounded-full bg-brand-primary text-white hover:bg-brand-primary-hover disabled:bg-brand-surface disabled:text-brand-text-secondary disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-brand-primary/20"
            >
                {isGenerating ? (
                    <>
                        <LoadingSpinner className="w-6 h-6" />
                        Generating...
                    </>
                ) : mainAudioState === 'playing' ? (
                    <>
                        <PauseIcon className="w-6 h-6" />
                        Stop Playback
                    </>
                ) : (
                    <>
                        <PlayIcon className="w-6 h-6" />
                        Generate & Play
                    </>
                )}
            </button>
          </div>
      </footer>
    </div>
  );
};

export default App;
