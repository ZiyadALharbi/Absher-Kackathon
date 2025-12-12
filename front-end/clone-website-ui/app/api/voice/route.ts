import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    console.log('📥 [Voice API] Received request');
    console.log('📦 [Voice API] Audio file:', audioFile ? audioFile.name : 'null');
    console.log('📦 [Voice API] Audio size:', audioFile ? audioFile.size : 0, 'bytes');

    if (!audioFile || audioFile.size < 1000) {
      console.error('❌ [Voice API] Audio file missing or too small');
      return NextResponse.json(
        { error: 'Audio file is required and must be at least 1KB' },
        { status: 400 }
      );
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Convert webm to proper format for Whisper
    console.log('🔄 [Voice API] Preparing audio for Whisper...');
    
    // Create FormData for OpenAI Whisper
    const whisperFormData = new FormData();
    
    // Create a new Blob with proper audio type
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { 
      type: 'audio/webm' 
    });
    
    whisperFormData.append('file', audioBlob, 'audio.webm');
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'ar'); // Arabic

    console.log('🌐 [Voice API] Calling OpenAI Whisper...');
    
    // Call OpenAI Whisper API
    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: whisperFormData,
      }
    );

    console.log('📡 [Voice API] Whisper response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Voice API] OpenAI Whisper error:', errorText);
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [Voice API] Transcription successful');
    console.log('📝 [Voice API] Transcribed text:', data.text);
    
    return NextResponse.json({
      text: data.text,
    });
  } catch (error) {
    console.error('Voice transcription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
