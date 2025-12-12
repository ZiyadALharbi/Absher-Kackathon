'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// 🎯 CASE 1: Proactive Language Detection Demo
// This modal appears ONLY for non-Arabic residents (e.g., Indonesian)
// on their FIRST login to help them change the platform language

interface LanguageOption {
  code: string;
  name: string;
  nameInLanguage: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'ar', name: 'العربية', nameInLanguage: '', flag: '🇸🇦' },
  { code: 'en', name: 'English', nameInLanguage: '', flag: '🇬🇧' },
  { code: 'id', name: 'Indonesian', nameInLanguage: '', flag: '🇮🇩' },
];

interface LanguageDetectionModalProps {
  userNationality: string;
  onLanguageSelect: (languageCode: string) => void;
  onSkip: () => void;
}

export default function LanguageDetectionModal({
  userNationality,
  onLanguageSelect,
  onSkip,
}: LanguageDetectionModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  const handleSelect = (code: string) => {
    setSelectedLanguage(code);
    setTimeout(() => {
      onLanguageSelect(code);
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      dir="rtl"
    >
      <div 
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 transform transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00663D] to-[#004A2C] text-white p-6 rounded-t-3xl relative">
          <button
            onClick={handleSkip}
            className="absolute left-4 top-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="text-5xl mb-3">🌍</div>
            <h2 className="text-2xl font-bold mb-2">مرحباً بك في أبشر!</h2>
            <p className="text-white/90 text-sm">Welcome to Absher!</p>
            <p className="text-white/90 text-sm">Selamat datang di Absher!</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Notice Message */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
            <div className="space-y-3">
              <p className="text-sm text-gray-800 leading-relaxed">
                النظام لاحظ أن جنسيتك <strong>{userNationality}</strong> واقترح تغيير اللغة لتسهيل استخدام المنصة.
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">
                Sistem mendeteksi kebangsaan Anda <strong>{userNationality}</strong> dan menyarankan perubahan bahasa untuk kemudahan penggunaan platform.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 text-center space-y-2">
            <p className="text-gray-800 font-semibold">
              هل ترغب بتحويل لغة المنصة لتناسبك؟
            </p>
            <p className="text-gray-600 text-sm">
              Would you like to change the platform language?
            </p>
            <p className="text-gray-600 text-sm">
              Apakah Anda ingin mengubah bahasa platform?
            </p>
          </div>

          {/* Language Options */}
          <div className="space-y-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-right ${
                  selectedLanguage === lang.code
                    ? 'border-[#00663D] bg-[#00663D]/10 scale-105 shadow-lg'
                    : 'border-gray-200 hover:border-[#00663D] hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{lang.flag}</span>
                    <p className="font-bold text-gray-800 text-lg">{lang.name}</p>
                  </div>
                  {selectedLanguage === lang.code && (
                    <div className="w-6 h-6 bg-[#00663D] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="w-full mt-4 p-3 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            تخطي • Skip • Lewati
          </button>
        </div>

        {/* Footer Note */}
        <div className="px-6 pb-6">
          <p className="text-xs text-center text-gray-500">
            💡 يمكنك تغيير اللغة في أي وقت من الإعدادات
          </p>
        </div>
      </div>
    </div>
  );
}

