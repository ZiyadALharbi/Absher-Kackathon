'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// 🎯 DEMO: Mock Users for Hackathon
const DEMO_USERS = [
  {
    id: 'user_indonesian',
    name: 'Budi Santoso',
    nationality: 'Indonesia',
    nationalId: '1234567890',
    isFirstLogin: true, // Will trigger language modal
    preferredLanguage: null,
  },
  {
    id: 'user_arabic',
    name: 'أحمد محمد',
    nationality: 'Saudi Arabia',
    nationalId: '9876543210',
    isFirstLogin: false,
    preferredLanguage: 'ar',
    // 🧠 Behavioral Profile Demo
    behavioralProfile: {
      lastTopic: 'المخالفات',
      lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      attempts: 3,
      lastQuestion: 'كيف أسدد المخالفات؟',
    },
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (userId: string) => {
    setSelectedUser(userId);
    setIsLoading(true);

    // Find user
    const user = DEMO_USERS.find(u => u.id === userId);
    if (!user) return;

    // Save to localStorage for demo
    localStorage.setItem('demo_user', JSON.stringify(user));
    localStorage.setItem('demo_logged_in', 'true');

    // Simulate API delay
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00663D] via-[#004A2C] to-[#003420]"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-white rounded-full p-4 shadow-2xl">
              <Image 
                src="/aoun.png" 
                alt="عون" 
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">أبشر</h1>
          <p className="text-white/80">منصة الخدمات الإلكترونية الحكومية</p>
          
          {/* Demo Badge */}
          <div className="mt-4 inline-block bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold">
            🏆 نسخة الهاكاثون - Demo
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            اختر مستخدم للتجربة
          </h2>

          <div className="space-y-4">
            {/* User 1: Indonesian (Case 1 Demo) */}
            <button
              onClick={() => handleLogin('user_indonesian')}
              disabled={isLoading}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-right ${
                selectedUser === 'user_indonesian'
                  ? 'border-[#00663D] bg-[#00663D]/5'
                  : 'border-gray-200 hover:border-[#00663D] hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  🇮🇩
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-800">Budi Santoso</p>
                  <p className="text-sm text-gray-600">Indonesia • أول تسجيل دخول</p>
                  <div className="mt-2 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    🎯 Case 1: Proactive Language
                  </div>
                </div>
              </div>
            </button>

            {/* User 2: Arabic (Case 2 Demo) */}
            <button
              onClick={() => handleLogin('user_arabic')}
              disabled={isLoading}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-right ${
                selectedUser === 'user_arabic'
                  ? 'border-[#00663D] bg-[#00663D]/5'
                  : 'border-gray-200 hover:border-[#00663D] hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00663D] to-[#004A2C] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  🇸🇦
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-800">أحمد محمد</p>
                  <p className="text-sm text-gray-600">السعودية • مستخدم عائد</p>
                  <div className="mt-2 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    🧠 Case 2: Behavioral Profile
                  </div>
                </div>
              </div>
            </button>
          </div>

          {isLoading && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-[#00663D]">
                <div className="w-4 h-4 border-2 border-[#00663D] border-t-transparent rounded-full animate-spin"></div>
                <span>جاري تسجيل الدخول...</span>
              </div>
            </div>
          )}

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 leading-relaxed">
              💡 <strong>للتجربة:</strong> اختر أي مستخدم لرؤية كيف يتكيف النظام تلقائياً!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/60 text-sm">
          <p>وزارة الداخلية • المملكة العربية السعودية</p>
          <p className="mt-2">Absher Kackathon 2025</p>
        </div>
      </div>
    </div>
  );
}

