"use client"

import { useState } from "react"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import AreasSection from "@/components/areas-section"
import HowItWorks from "@/components/how-it-works"
import PricingSection from "@/components/pricing-section"
import TestimonialsSection from "@/components/testimonials-section"
import FAQSection from "@/components/faq-section"
import Footer from "@/components/footer"
import LoginModal from "@/components/login-modal"
import ChatManager from "@/components/chat-manager"
import { Heart } from "lucide-react" // Corrigido para lucide-react

export default function LandingPage() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleLoginSuccess = (data: any) => {
    setUserData(data)
    setIsLoginModalOpen(false)
    // Abrir chat automaticamente após login
    setIsChatOpen(true)
  }

  const handleLogout = () => {
    setUserData(null)
    setIsChatOpen(false)
  }

  const handleOpenChat = () => {
    if (userData?.isLoggedIn) {
      setIsChatOpen(true)
    } else {
      setIsLoginModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header userData={userData} onLogout={handleLogout} onLoginSuccess={handleLoginSuccess} />
      <main>
        <HeroSection onOpenChat={handleOpenChat} userData={userData} />
        <AreasSection />
        <HowItWorks />
        <PricingSection onOpenChat={handleOpenChat} userData={userData} />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {userData?.isLoggedIn && (
        <ChatManager isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} userName={userData.name} />
      )}

      {/* Botão flutuante para abrir chat */}
      {userData?.isLoggedIn && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-40"
        >
          <Heart className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
