// Global state for audio management
let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;
let isProcessing = false; // Guard to prevent concurrent calls

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
  console.log('🔄 [speakArabic] isProcessing:', isProcessing);
  
  // CRITICAL: Prevent concurrent calls
  if (isProcessing) {
    console.warn('⚠️ [speakArabic] Already processing - REJECTING duplicate call!');
    return Promise.resolve();
  }
  
  isProcessing = true;
  console.log('✅ [speakArabic] isProcessing set to TRUE - processing started');
  
  try {
    // Stop any currently playing audio FIRST
    console.log('🛑 [speakArabic] Calling stopSpeaking()...');
    stopSpeaking();
    console.log('✅ [speakArabic] stopSpeaking() done');
    
    // Wait longer to ensure previous audio is FULLY stopped and cleaned up
    console.log('⏰ [speakArabic] Waiting 300ms to ensure previous audio fully stopped...');
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('✅ [speakArabic] Wait done - previous audio should be fully stopped');

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
      isProcessing = false; // Reset processing flag
      console.log('🎵 [speakArabic] isPlaying set to FALSE');
      console.log('🔄 [speakArabic] isProcessing set to FALSE');
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
      isProcessing = false; // Reset processing flag on error
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
    isProcessing = false; // Reset processing flag on error
    currentAudio = null;
    throw error;
  }
}

/**
 * Stop the currently playing audio
 */
export function stopSpeaking(): void {
  console.log('🛑 [stopSpeaking] Called');
  if (currentAudio) {
    console.log('🛑 [stopSpeaking] Stopping current audio...');
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null; // Remove event listeners
    currentAudio.onerror = null;
    currentAudio = null;
    console.log('✅ [stopSpeaking] Audio stopped and cleaned up');
  }
  isPlaying = false;
  isProcessing = false; // Reset processing flag
  console.log('✅ [stopSpeaking] isPlaying set to FALSE');
  console.log('✅ [stopSpeaking] isProcessing set to FALSE');
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
