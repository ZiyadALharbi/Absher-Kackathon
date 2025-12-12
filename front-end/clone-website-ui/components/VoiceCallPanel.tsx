'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';
import { speakArabic, stopSpeaking } from '@/utils/speak';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceCallPanelProps {
  onClose: () => void;
  onSendMessage?: (message: string) => Promise<string>;
}

// VAD Configuration - EXACT as specified
const VAD_CONFIG = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  voiceThreshold: 5,
  silenceDuration: 1000,
  maxRecordingTime: 6000,
};

// MediaRecorder Configuration - EXACT as specified
const MEDIA_RECORDER_CONFIG = {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 128000,
};

const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
};

export default function VoiceCallPanel({
  onClose,
  onSendMessage,
}: VoiceCallPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpeakTimeRef = useRef<number>(Date.now());

  // Initialize greeting when component mounts
  useEffect(() => {
    console.log('═══════════════════════════════════════════');
    console.log('🎬 [VoiceCall] Component mounted - Starting initialization');
    console.log('═══════════════════════════════════════════');
    
    // Play phone ring tone
    const ringTone = new Audio();
    ringTone.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzeM0fPTgjMGHm7A7+OZUQ8MUKjj8bllHAU3kdfy0H4sBSh+zPLckUELEF247NygThELTKXh8sNtJAU3i9Ty1YU1BiBwwe/onlENDFGn4/K5ZRsEOJLY89F+KwUoffDy3JFADQ1dtu3bomwgBDSH0fPUgzQGIm/A7eSVUBEPUKjj8bdkGwQ4ktf00H8sBSh7yfLdkUILEF235N+iaw8FNQUA';
    ringTone.volume = 0.3;
    ringTone.play();
    
    // Simulate connecting state (2 seconds)
    console.log('📞 [VoiceCall] Simulating phone connection...');
    setTimeout(() => {
      setIsConnecting(false);
      ringTone.pause();
      
      const greeting = 'السلام عليكم، أنا عون، مساعدك الذكي للخدمات الحكومية. كيف أقدر أساعدك اليوم؟';
      setMessages([
        {
          role: 'assistant',
          content: greeting,
          timestamp: new Date(),
        },
      ]);

      console.log('🔊 [VoiceCall] Starting greeting TTS');
      console.log('📝 [VoiceCall] Greeting text:', greeting);
      
      // Speak greeting - wait until audio FULLY finishes before allowing user to speak
      setIsSpeaking(true);
      console.log('🎤 [VoiceCall] isSpeaking set to TRUE');
      
      speakArabic(greeting, () => {
        console.log('✅ [VoiceCall] Greeting TTS finished');
        
        // Wait 1.5 seconds AFTER audio fully ends to ensure user hears everything
        console.log('⏰ [VoiceCall] Waiting 1500ms to ensure audio fully finished...');
        setTimeout(() => {
          setIsSpeaking(false);
          console.log('🎤 [VoiceCall] isSpeaking set to FALSE');
          console.log('🎙️ [VoiceCall] NOW starting recording - your turn!');
          startRecording();
        }, 1500);
      }).catch((err) => {
        console.error('❌ [VoiceCall] Greeting TTS failed:', err);
        setIsSpeaking(false);
        console.log('🎤 [VoiceCall] isSpeaking set to FALSE (after error)');
        
        // Still try to start recording after delay
        setTimeout(() => {
          console.log('🎙️ [VoiceCall] Starting recording after error...');
          startRecording();
        }, 1500);
      });
    }, 2000);

    // Call duration timer
    const callStartTime = Date.now();
    const durationInterval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);

    return () => {
      console.log('🛑 [VoiceCall] Component unmounting - cleanup');
      clearInterval(durationInterval);
      ringTone.pause();
      cleanup();
    };
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopRecording();
    stopSpeaking();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  }, []);

  // VAD - Voice Activity Detection
  const checkVoiceActivity = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average amplitude
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average);

    // Voice detected
    if (average > VAD_CONFIG.voiceThreshold) {
      lastSpeakTimeRef.current = Date.now();
      
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } else {
      // Silence detected
      const silenceDuration = Date.now() - lastSpeakTimeRef.current;
      
      if (silenceDuration >= VAD_CONFIG.silenceDuration && !silenceTimerRef.current) {
        // Stop recording after silence
        stopRecording();
      }
    }

    animationFrameRef.current = requestAnimationFrame(checkVoiceActivity);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    console.log('───────────────────────────────────────────');
    console.log('▶️ [Recording] startRecording() called');
    console.log('🎤 [Recording] Current isSpeaking:', isSpeaking);
    console.log('📊 [Recording] Current isRecording:', isRecording);
    
    try {
      // Don't start recording if already speaking
      if (isSpeaking) {
        console.warn('⚠️ [Recording] Cannot start - still speaking!');
        console.log('🔴 [Recording] BLOCKED: isSpeaking is TRUE');
        return;
      }

      if (isRecording) {
        console.warn('⚠️ [Recording] Already recording!');
        return;
      }

      console.log('✅ [Recording] Checks passed - proceeding...');
      setError(null);
      
      // Stop any playing audio first
      console.log('🔇 [Recording] Calling stopSpeaking()...');
      stopSpeaking();
      console.log('✅ [Recording] stopSpeaking() done');
      
      // Get user media with MAXIMUM echo cancellation
      console.log('🎤 [Recording] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
          sampleRate: { ideal: 48000 },
          channelCount: 1,
        },
      });
      console.log('✅ [Recording] Microphone access granted');
      
      streamRef.current = stream;

      // Setup audio context for VAD
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = VAD_CONFIG.fftSize;
      analyserRef.current.smoothingTimeConstant = VAD_CONFIG.smoothingTimeConstant;
      source.connect(analyserRef.current);

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream, MEDIA_RECORDER_CONFIG);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm;codecs=opus',
        });
        
        console.log('📦 [Recording] onstop - blob size:', audioBlob.size);
        
        // Send to STT only if blob has enough data (>1KB)
        if (audioBlob.size > 1000) {
          console.log('✅ [Recording] Blob valid - processing...');
          await processAudio(audioBlob);
        } else {
          console.log('⚠️ [Recording] Blob too small - ignoring');
        }
      };

      // Start recording
      console.log('🎙️ [Recording] Starting MediaRecorder...');
      mediaRecorder.start();
      setIsRecording(true);
      console.log('✅ [Recording] MediaRecorder started - isRecording set to TRUE');
      lastSpeakTimeRef.current = Date.now();

      // Start VAD
      console.log('👂 [Recording] Starting Voice Activity Detection...');
      checkVoiceActivity();

      // Max recording time
      console.log(`⏱️ [Recording] Setting max recording time: ${VAD_CONFIG.maxRecordingTime}ms`);
      recordingTimerRef.current = setTimeout(() => {
        console.log('⏰ [Recording] Max time reached - stopping...');
        stopRecording();
      }, VAD_CONFIG.maxRecordingTime);

      // Update recording time
      const startTime = Date.now();
      const timer = setInterval(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          setRecordingTime(Date.now() - startTime);
        } else {
          clearInterval(timer);
        }
      }, 100);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('فشل الوصول إلى الميكروفون');
    }
  }, [checkVoiceActivity, isSpeaking]);

  // Stop recording
  const stopRecording = useCallback(() => {
    // Prevent infinite loops - check if already stopped
    if (!mediaRecorderRef.current && !streamRef.current) {
      return;
    }
    
    console.log('───────────────────────────────────────────');
    console.log('⏹️ [Recording] stopRecording() called');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('🛑 [Recording] Stopping MediaRecorder...');
      mediaRecorderRef.current.stop();
      console.log('✅ [Recording] MediaRecorder stopped');
    }
    
    if (streamRef.current) {
      console.log('🔇 [Recording] Stopping audio tracks...');
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      console.log('✅ [Recording] Audio tracks stopped');
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    mediaRecorderRef.current = null;
    setIsRecording(false);
    console.log('✅ [Recording] isRecording set to FALSE');
    setRecordingTime(0);
    setAudioLevel(0);
  }, []); // No dependencies - prevent infinite loops

  // Process audio (STT → Chat → TTS)
  const processAudio = useCallback(async (audioBlob: Blob) => {
    console.log('═══════════════════════════════════════════');
    console.log('🔄 [Process] Starting audio processing');
    console.log('📦 [Process] Audio blob size:', audioBlob.size, 'bytes');
    
    try {
      // Step 1: Speech-to-Text
      console.log('📝 [STT] Step 1: Speech-to-Text');
      const formData = new FormData();
      formData.append('audio', audioBlob);

      console.log('🌐 [STT] Sending request to /api/voice...');
      const sttResponse = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 [STT] Response status:', sttResponse.status);
      
      if (!sttResponse.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const { text: userText } = await sttResponse.json();
      console.log('✅ [STT] Transcription successful');
      console.log('📝 [STT] User text:', userText);
      
      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: userText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Step 2: Get AI response
      console.log('🤖 [AI] Step 2: Getting AI response');
      let aiResponse: string;
      if (onSendMessage) {
        console.log('📞 [AI] Using custom onSendMessage callback');
        aiResponse = await onSendMessage(userText);
      } else {
        console.log('🌐 [AI] Using default /api/chat endpoint');
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText }),
        });
        
        console.log('📡 [AI] Response status:', chatResponse.status);
        
        if (!chatResponse.ok) {
          throw new Error('Failed to get AI response');
        }
        
        const chatData = await chatResponse.json();
        aiResponse = chatData.response;
      }

      console.log('✅ [AI] Got AI response');
      console.log('💬 [AI] Response:', aiResponse);

      // Add AI message
      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      console.log('✅ [AI] Message added to chat');

      // Step 3: Text-to-Speech
      console.log('🔊 [TTS] Step 3: Text-to-Speech');
      
      // Make sure recording is FULLY stopped before speaking
      console.log('🛑 [TTS] Stopping any recording...');
      stopRecording();
      
      // Wait a moment to ensure recording is fully stopped
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ [TTS] Recording fully stopped - waited 500ms');
      
      console.log('🎤 [TTS] Setting isSpeaking to TRUE');
      setIsSpeaking(true);
      console.log('🔊 [TTS] Calling speakArabic()...');
      
      await speakArabic(aiResponse, () => {
        console.log('✅ [TTS] Audio finished playing');
        
        // Wait 1.5 seconds AFTER audio fully ends to ensure user hears everything
        console.log('⏰ [TTS] Waiting 1500ms to ensure audio fully finished...');
        setTimeout(() => {
          console.log('🎤 [TTS] Setting isSpeaking to FALSE');
          setIsSpeaking(false);
          console.log('🎙️ [TTS] NOW starting recording - your turn!');
          startRecording();
        }, 1500);
      });

    } catch (err) {
      console.error('Error processing audio:', err);
      setError('حدث خطأ في معالجة الصوت');
      setIsSpeaking(false);
      
      // Retry recording after 3 second delay
      console.log('⏰ [Error] Waiting 3000ms before retrying...');
      setTimeout(() => {
        if (!isSpeaking) {
          console.log('🔄 [Error] Retrying - calling startRecording()');
          setError(null);
          startRecording();
        }
      }, 3000);
    }
  }, [onSendMessage, startRecording, stopRecording, isSpeaking]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center z-50" dir="rtl">
      {isConnecting ? (
        // Connecting Screen (Phone Call Style)
        <div className="flex flex-col items-center gap-6 text-white">
          <div className="relative">
            {/* Aoun Avatar while connecting */}
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#00663D] shadow-2xl animate-pulse">
              <img 
                src="/aoun.png" 
                alt="عون"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 w-40 h-40 bg-[#00663D] rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 w-40 h-40 bg-[#00663D] rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">عون 🇸🇦</h2>
            <p className="text-lg text-gray-300 animate-pulse">جاري الاتصال...</p>
            <div className="flex gap-2 justify-center mt-4">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      ) : (
        // Call Screen (Phone Call Style)
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-md flex flex-col" style={{ height: '90vh', maxHeight: '700px' }}>
          {/* Header - Phone Call Style */}
          <div className="bg-gradient-to-r from-[#00663D] to-[#004A2C] text-white p-6 rounded-t-3xl text-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="flex flex-col items-center gap-3 relative z-10">
              {/* Small Aoun Avatar in Header */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                <img 
                  src="/aoun.png" 
                  alt="عون"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">عون</h2>
                <p className="text-sm text-white/80 mt-1">🇸🇦 مساعدك الذكي للخدمات الحكومية</p>
                <p className="text-lg font-mono mt-2 text-white/90 bg-white/10 rounded-full px-4 py-1 inline-block">
                  ⏱️ {formatDuration(callDuration)}
                </p>
              </div>
            </div>
          </div>

        {/* Call Status - Voice Only (No Chat Bubbles) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-gradient-to-b from-gray-700 to-gray-800">
          {/* Voice Activity Indicator */}
          <div className="flex flex-col items-center gap-8">
            {/* Aoun Avatar - Animated */}
            <div className="relative">
              {/* Main Avatar Circle */}
              <div className={`w-48 h-48 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-2xl ${
                isSpeaking 
                  ? 'border-[#00663D] shadow-[#00663D]/50 scale-110 ring-4 ring-[#00663D]/30' 
                  : isRecording
                  ? 'border-red-500 shadow-red-500/50 animate-pulse ring-4 ring-red-500/30'
                  : 'border-gray-500 shadow-gray-500/50'
              }`}>
                <img 
                  src="/aoun.png" 
                  alt="عون - المساعد الذكي"
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isSpeaking || isRecording ? 'scale-110' : 'scale-100'
                  }`}
                />
              </div>
              
              {/* Ripple effect when speaking */}
              {isSpeaking && (
                <>
                  <div className="absolute inset-0 w-48 h-48 bg-[#00663D] rounded-full animate-ping opacity-20"></div>
                  <div className="absolute inset-0 w-48 h-48 bg-[#00663D] rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
                  {/* Sound waves indicator */}
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                    <Volume2 className="w-8 h-8 text-[#00663D] animate-pulse" />
                  </div>
                </>
              )}
              
              {/* Ripple effect when recording (user speaking) */}
              {isRecording && (
                <>
                  <div className="absolute inset-0 w-48 h-48 bg-red-500 rounded-full animate-ping opacity-20"></div>
                  <div className="absolute inset-0 w-48 h-48 bg-red-500 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
                  {/* Mic indicator */}
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-red-500 rounded-full p-2 shadow-lg">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                </>
              )}
              
              {/* Waiting state glow */}
              {!isRecording && !isSpeaking && (
                <div className="absolute inset-0 w-48 h-48 bg-white rounded-full animate-pulse opacity-5"></div>
              )}
            </div>
            
            {/* Status Text */}
            <div className="text-center">
              {isSpeaking && (
                <p className="text-2xl font-bold text-white animate-pulse">عون يتحدث...</p>
              )}
              {isRecording && (
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-white">أنت تتحدث...</p>
                  <p className="text-lg text-gray-300 font-mono">
                    {(recordingTime / 1000).toFixed(1)}s
                  </p>
                  {/* Audio Level Bars */}
                  <div className="flex gap-1 justify-center items-end h-16">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-3 bg-red-500 rounded-full transition-all duration-100"
                        style={{
                          height: `${Math.max(10, Math.min(64, (audioLevel + Math.random() * 20) * (i + 1) / 4))}px`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {!isRecording && !isSpeaking && (
                <p className="text-xl text-gray-400">في انتظار حديثك...</p>
              )}
            </div>
            
            {/* Last Message Display with Avatar */}
            {messages.length > 0 && (
              <div className="mt-8 max-w-md w-full px-4">
                <div className={`flex gap-3 items-start ${
                  messages[messages.length - 1].role === 'user' 
                    ? 'flex-row-reverse' 
                    : 'flex-row'
                }`}>
                  {/* Avatar */}
                  {messages[messages.length - 1].role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                        <img 
                          src="/aoun.png" 
                          alt="عون"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {messages[messages.length - 1].role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00663D] to-[#004A2C] flex items-center justify-center border-2 border-white/30 shadow-lg">
                        <span className="text-white text-lg">👤</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Message Bubble */}
                  <div className={`rounded-2xl p-4 backdrop-blur-sm max-w-xs ${
                    messages[messages.length - 1].role === 'user'
                      ? 'bg-[#00663D]/80 text-white'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}>
                    <p className="text-sm leading-relaxed">
                      {messages[messages.length - 1].content}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Controls - Phone Style */}
        <div className="p-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-3xl">
          <div className="flex justify-center items-center gap-8">
            {/* Mute Button (Disabled for now) */}
            <button
              disabled
              className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center opacity-50 cursor-not-allowed"
            >
              <MicOff className="w-7 h-7 text-gray-400" />
            </button>

            {/* End Call Button */}
            <button
              onClick={() => {
                cleanup();
                onClose();
              }}
              className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95"
            >
              <PhoneOff className="w-9 h-9 text-white" />
            </button>

            {/* Speaker Button (Disabled for now) */}
            <button
              disabled
              className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center opacity-50 cursor-not-allowed"
            >
              <Volume2 className="w-7 h-7 text-gray-400" />
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
