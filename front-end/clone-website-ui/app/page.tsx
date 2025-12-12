'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from "@/components/header"
import SearchBar from "@/components/search-bar"
import MainContent from "@/components/main-content"
import RightSidebar from "@/components/right-sidebar"
import Footer from "@/components/footer"
import LanguageDetectionModal from "@/components/LanguageDetectionModal"

const VoiceCallButton = dynamic(() => import('@/components/VoiceCallButton'), { ssr: false });
const AounChatButton = dynamic(() => import('@/components/AounChatButton'), { ssr: false });
const LifeEventBundles = dynamic(() => import('@/components/LifeEventBundles'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [userNationality, setUserNationality] = useState<string | null>(null);

  useEffect(() => {
    // 🎯 CASE 1: Proactive Language Detection Demo
    // Check if user is logged in and if language modal should be shown
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('demo_logged_in');
      const userDataStr = localStorage.getItem('demo_user');
      
      if (!loggedIn || !userDataStr) {
        // Not logged in -> redirect to login
        router.push('/login');
        return;
      }

      const userData = JSON.parse(userDataStr);
      
      // Check if this is first login AND non-Arabic nationality
      if (
        userData.isFirstLogin &&
        userData.nationality !== 'Saudi Arabia' &&
        !userData.preferredLanguage
      ) {
        setUserNationality(userData.nationality);
        // Show language modal after a brief delay for better UX
        setTimeout(() => setShowLanguageModal(true), 1000);
      }
    }
  }, [router]);

  const handleLanguageSelect = (languageCode: string) => {
    console.log('🌍 [Language Selected]:', languageCode);
    
    // Save preference
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('demo_user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.preferredLanguage = languageCode;
        userData.isFirstLogin = false; // Don't show again
        localStorage.setItem('demo_user', JSON.stringify(userData));
      }
    }
    
    // Close modal
    setShowLanguageModal(false);
    
    // In a real app, this would trigger i18n change
    // For demo, just log it
    console.log('✅ Language saved! In production, UI would switch to:', languageCode);
  };

  const handleSkipLanguage = () => {
    console.log('⏭️ [Language Modal] Skipped');
    
    // Mark as not first login
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('demo_user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.isFirstLogin = false;
        localStorage.setItem('demo_user', JSON.stringify(userData));
      }
    }
    
    setShowLanguageModal(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <Header />
      <div className="flex flex-row gap-6 px-6 py-6 max-w-[1800px] mx-auto">
        <RightSidebar />
        <div className="flex-1 space-y-6">
          <SearchBar />
          <MainContent />
          
          {/* Life Events Section */}
          <div className="bg-white rounded-lg border border-[#E4E4E7] p-6 shadow-md">
            <LifeEventBundles />
          </div>
        </div>
      </div>
      <Footer />
      
      <VoiceCallButton />
      <AounChatButton />

      {/* 🎯 CASE 1: Proactive Language Detection Modal */}
      {showLanguageModal && userNationality && (
        <LanguageDetectionModal
          userNationality={userNationality}
          onLanguageSelect={handleLanguageSelect}
          onSkip={handleSkipLanguage}
        />
      )}
    </div>
  )
}
