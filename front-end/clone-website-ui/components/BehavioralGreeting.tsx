'use client';

import { useEffect, useState } from 'react';

// 🎯 CASE 2: Behavioral Profile + Proactive Chat Greeting
// This greeting appears automatically when a returning user opens the chat
// Shows intelligence based on their previous interactions

interface BehavioralProfile {
  lastTopic: string;
  lastVisit: string;
  attempts: number;
  lastQuestion?: string;
}

interface BehavioralGreetingProps {
  profile: BehavioralProfile;
  userName: string;
}

export default function BehavioralGreeting({ profile, userName }: BehavioralGreetingProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in after a short delay
    setTimeout(() => setIsVisible(true), 500);
  }, []);

  // Calculate days since last visit
  const daysSinceLastVisit = Math.floor(
    (Date.now() - new Date(profile.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getTimeText = () => {
    if (daysSinceLastVisit === 0) return 'اليوم';
    if (daysSinceLastVisit === 1) return 'أمس';
    if (daysSinceLastVisit === 2) return 'قبل يومين';
    return `قبل ${daysSinceLastVisit} أيام`;
  };

  return (
    <div
      className={`transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      dir="rtl"
    >
      {/* Greeting Message */}
      <div className="flex gap-2 items-end justify-start">
        {/* Aoun Avatar */}
        <div className="flex-shrink-0 mb-1">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00663D] shadow-md">
            <img 
              src="/aoun.png" 
              alt="عون"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Message Bubble */}
        <div className="bg-gradient-to-br from-[#00663D]/10 to-[#004A2C]/5 border-2 border-[#00663D] rounded-2xl p-4 max-w-md shadow-lg">
          <p className="text-xs font-bold text-[#00663D] mb-2">عون</p>
          
          <div className="space-y-3 text-gray-800">
            {/* Greeting */}
            <p className="font-bold text-lg">
              أهلاً وسهلاً {userName ? userName : ''}! 👋
            </p>

            {/* Behavioral Intelligence */}
            <div className="space-y-2 text-sm leading-relaxed">
              <p>
                لاحظنا أن آخر استفساراتك كانت حول <strong className="text-[#00663D]">{profile.lastTopic}</strong>،
              </p>
              
              <p>
                وآخر محاولة لك كانت <strong className="text-[#00663D]">{getTimeText()}</strong>.
              </p>

              {profile.attempts > 1 && (
                <p>
                  لديك <strong className="text-[#00663D]">{profile.attempts} محاولات</strong> سابقة في هذا الموضوع.
                </p>
              )}

              {profile.lastQuestion && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg border border-[#00663D]/20">
                  <p className="text-xs text-gray-600 mb-1">آخر سؤال:</p>
                  <p className="text-sm">"{profile.lastQuestion}"</p>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="mt-4 pt-3 border-t border-[#00663D]/20">
              <p className="font-semibold text-[#00663D]">
                هل تحب نكمل من حيث توقّفنا؟ 😊
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-3">
            {new Date().toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

