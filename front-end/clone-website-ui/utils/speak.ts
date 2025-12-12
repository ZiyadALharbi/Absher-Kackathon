// Global state for audio management
let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;

/**
 * Speak Arabic text using ElevenLabs TTS
 * @param text - Arabic text to speak
 * @param onEnd - Callback when audio finishes playing
 */
export async function speakArabic(
  text: string,
  onEnd?: () => void
): Promise<void> {
  console.log('═══════════════════════════════════════════');
  console.log('🔊 [speakArabic] Function called');
  console.log('📝 [speakArabic] Text:', text.substring(0, 50) + '...');
  console.log('🎵 [speakArabic] Current isPlaying:', isPlaying);
  console.log('🎵 [speakArabic] Current audio:', currentAudio ? 'EXISTS' : 'null');
  
  try {
    // Stop any currently playing audio FIRST
    console.log('🛑 [speakArabic] Calling stopSpeaking()...');
    stopSpeaking();
    console.log('✅ [speakArabic] stopSpeaking() done');
    
    // Wait a bit to ensure previous audio is fully stopped
    console.log('⏰ [speakArabic] Waiting 100ms...');
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ [speakArabic] Wait done');

    // Call TTS API
    console.log('🌐 [speakArabic] Calling TTS API...');
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    console.log('📡 [speakArabic] TTS API response:', response.status);

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    // Get audio blob
    const audioBlob = await response.blob();
    console.log('📦 [speakArabic] Audio blob size:', audioBlob.size, 'bytes');
    
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log('🔗 [speakArabic] Audio URL created');

    // Create and play audio
    console.log('🎵 [speakArabic] Creating Audio element...');
    currentAudio = new Audio(audioUrl);
    currentAudio.volume = 1.0; // Full volume
    
    // Set crossOrigin to anonymous to avoid CORS issues
    currentAudio.crossOrigin = 'anonymous';
    
    isPlaying = true;
    console.log('✅ [speakArabic] Audio element created - isPlaying set to TRUE');

    // Set up event listeners BEFORE playing
    currentAudio.onended = () => {
      console.log('✅ [speakArabic] Audio ENDED event fired');
      isPlaying = false;
      console.log('🎵 [speakArabic] isPlaying set to FALSE');
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      console.log('🗑️ [speakArabic] Audio cleaned up');
      
      if (onEnd) {
        console.log('📞 [speakArabic] Calling onEnd callback after 800ms...');
        // Longer delay to ensure audio is FULLY finished and user heard everything
        setTimeout(() => {
          console.log('✅ [speakArabic] onEnd callback executed - audio FULLY done');
          onEnd();
        }, 800);
      } else {
        console.log('ℹ️ [speakArabic] No onEnd callback provided');
      }
    };

    currentAudio.onerror = (error) => {
      console.error('❌ [speakArabic] Audio playback error:', error);
      isPlaying = false;
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      if (onEnd) {
        onEnd();
      }
    };

    // Load and play the audio
    console.log('📥 [speakArabic] Loading audio...');
    currentAudio.load();
    
    console.log('▶️ [speakArabic] Starting playback...');
    try {
      await currentAudio.play();
      console.log('✅ [speakArabic] Playback started successfully');
    } catch (playError) {
      console.error('❌ [speakArabic] Play failed:', playError);
      // Try one more time with user interaction
      console.log('🔄 [speakArabic] Retrying playback...');
      await new Promise(resolve => setTimeout(resolve, 100));
      await currentAudio.play();
      console.log('✅ [speakArabic] Playback started on retry');
    }
  } catch (error) {
    console.error('❌ [speakArabic] Error:', error);
    isPlaying = false;
    currentAudio = null;
    throw error;
  }
}

/**
 * Stop the currently playing audio
 */
export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  isPlaying = false;
}

/**
 * Get current voice playback information
 */
export function getVoiceInfo(): {
  isPlaying: boolean;
  currentAudio: HTMLAudioElement | null;
} {
  return {
    isPlaying,
    currentAudio,
  };
}
