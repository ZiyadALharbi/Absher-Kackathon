'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import violationsData from '@/data/violations.json';
import BehavioralGreeting from './BehavioralGreeting';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any;
}

export default function AounChat() {
  // 🎯 CASE 2: Behavioral Profile Demo
  const [showBehavioralGreeting, setShowBehavioralGreeting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🧠 Check for behavioral profile on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('demo_user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        
        // 🎯 CASE 2: Show behavioral greeting for returning Arabic users
        if (
          userData.behavioralProfile &&
          !userData.isFirstLogin &&
          userData.preferredLanguage === 'ar'
        ) {
          setUserProfile(userData);
          setShowBehavioralGreeting(true);
          // Don't show default greeting
        } else {
          // Show default greeting for other users
          setMessages([
            {
              role: 'assistant',
              content: 'مرحباً، أنا عون، المساعد الذكي للخدمات الحكومية. كيف يمكنني مساعدتك اليوم؟',
              timestamp: new Date(),
            },
          ]);
        }
      } else {
        // No user data - show default greeting
        setMessages([
          {
            role: 'assistant',
            content: 'مرحباً، أنا عون، المساعد الذكي للخدمات الحكومية. كيف يمكنني مساعدتك اليوم؟',
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleViolationPayment = (violationId: string) => {
    const violation = violationsData.find(v => v.id === violationId);
    if (violation) {
      // Check wallet balance
      const walletBalance = parseFloat(localStorage.getItem('wallet_balance') || '0');
      const amount = parseFloat(violation.amount);
      
      if (walletBalance >= amount) {
        // Deduct from wallet
        const newBalance = walletBalance - amount;
        localStorage.setItem('wallet_balance', newBalance.toString());
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ تم سداد المخالفة ${violationId} بمبلغ ${violation.amount} ريال من محفظتك بنجاح!\n\n💰 الرصيد المتبقي: ${newBalance.toFixed(2)} ريال\n\nشكراً لك على استخدام خدمات أبشر.\n\nيمكنك الاستمرار في استخدام الشات، وسيتم تحديث رصيد المحفظة تلقائياً.`,
          timestamp: new Date(),
        }]);
        
        // Trigger wallet update event without page reload
        window.dispatchEvent(new Event('walletUpdate'));
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ عذراً، رصيد محفظتك غير كافٍ لسداد هذه المخالفة.\n\n💰 الرصيد الحالي: ${walletBalance.toFixed(2)} ريال\n💳 المطلوب: ${amount.toFixed(2)} ريال\n\nيرجى شحن محفظتك من الأعلى ثم المحاولة مرة أخرى.`,
          timestamp: new Date(),
        }]);
      }
    }
  };

  const handleViolationAppeal = (violationId: string) => {
    const violation = violationsData.find(v => v.id === violationId);
    if (violation) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `📋 تم تقديم اعتراض على المخالفة ${violationId}\n\n⏳ سيتم مراجعة اعتراضك خلال 7 أيام عمل.\n\n📞 سيتم التواصل معك عبر الرسائل النصية والبريد الإلكتروني.\n\nرقم الاعتراض: ${Math.floor(Math.random() * 900000) + 100000}`,
        timestamp: new Date(),
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Call the real AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        data: data.data,
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. يرجى التأكد من إضافة GROQ_API_KEY في ملف .env.local',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      {/* No header - will be provided by parent */}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F7F7] rounded-t-lg">
        {/* 🎯 CASE 2: Behavioral Greeting (if applicable) */}
        {showBehavioralGreeting && userProfile?.behavioralProfile && (
          <BehavioralGreeting
            profile={userProfile.behavioralProfile}
            userName={userProfile.name}
          />
        )}
        
        {messages.map((message, index) => (
          <div key={index}>
            <div
              className={`flex gap-2 items-end ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Aoun Avatar for assistant messages */}
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mb-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#00663D] shadow-md">
                    <img 
                      src="/aoun.png" 
                      alt="عون"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-[#00663D] text-white'
                    : 'bg-white text-[#000000] border border-[#E4E4E7] shadow-sm'
                }`}
                dir="rtl"
              >
                {/* Name tag for assistant */}
                {message.role === 'assistant' && (
                  <p className="text-xs font-bold text-[#00663D] mb-1">عون</p>
                )}
                
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/80' : 'text-[#4A4A4A]'}`}>
                  {message.timestamp.toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              
              {/* User avatar (emoji) */}
              {message.role === 'user' && (
                <div className="flex-shrink-0 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00663D] to-[#004A2C] flex items-center justify-center border-2 border-white shadow-md">
                    <span className="text-white text-sm">👤</span>
                  </div>
                </div>
              )}
            </div>

            {/* Show violations if available */}
            {message.data && Array.isArray(message.data) && (
              <div className="mt-2 space-y-2">
                {message.data.map((violation: any) => (
                  <div key={violation.id} className="bg-white rounded-xl p-4 border-2 border-[#E4E4E7] hover:border-[#00663D] transition-all duration-300 hover:shadow-lg" dir="rtl">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-[#000000] text-base">{violation.description}</p>
                        <p className="text-xs text-[#4A4A4A] mt-1">📍 {violation.location}</p>
                        <p className="text-xs text-[#4A4A4A]">📅 {violation.date}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-[#DC2626]">{violation.amount} ريال</p>
                        <p className="text-xs text-[#4A4A4A] mt-1">رقم: {violation.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViolationPayment(violation.id)}
                        className="flex-1 bg-gradient-to-r from-[#00663D] to-[#004A2C] hover:from-[#004A2C] hover:to-[#003420] text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                      >
                        💳 سداد المخالفة
                      </button>
                      <button
                        onClick={() => handleViolationAppeal(violation.id)}
                        className="flex-1 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                      >
                        📋 اعتراض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 items-end justify-start">
            {/* Aoun Avatar while loading */}
            <div className="flex-shrink-0 mb-1">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#00663D] shadow-md animate-pulse">
                <img 
                  src="/aoun.png" 
                  alt="عون"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-[#E4E4E7] shadow-sm">
              <Loader2 className="w-5 h-5 text-[#00663D] animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#E4E4E7] bg-white rounded-b-lg">
        <div className="flex gap-2" dir="rtl">
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 bg-[#00663D] hover:bg-[#004A2C] text-white p-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب رسالتك هنا... (مثال: أبغى أعرف مخالفاتي)"
            className="flex-1 px-4 py-3 bg-[#F7F7F7] border border-[#E4E4E7] rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[#00663D] text-[#000000] placeholder:text-[#4A4A4A]"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

