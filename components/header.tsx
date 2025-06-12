"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart, User, LogOut } from "lucide-react"
import LoginModal from "./login-modal"

interface HeaderProps {
  userData?: any
  onLogout?: () => void
}

export default function Header({ userData, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const menuItems = [
    { name: "Início", href: "#inicio" },
    { name: "Como Funciona", href: "#como-funciona" },
    { name: "Planos", href: "#planos" },
    { name: "Depoimentos", href: "#depoimentos" },
    { name: "FAQ", href: "#faq" },
    { name: "Contato", href: "#contato" },
  ]

  const handleLoginSuccess = (data: any) => {
    // Esta função será passada do componente pai
    if (onLogout) {
      // Simular login bem-sucedido
      console.log("Login realizado:", data)
    }
  }

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutoAjuda Pro
              </span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* User Area */}
            <div className="hidden md:flex items-center gap-4">
              {userData?.isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">{userData.name}</span>
                  </div>
                  <Button onClick={onLogout} variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-6 py-2 transition-all duration-300 transform hover:scale-105"
                >
                  Entrar
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <nav className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}

                {userData?.isLoggedIn ? (
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{userData.name}</span>
                    </div>
                    <Button onClick={onLogout} variant="ghost" size="sm" className="text-red-600 justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-6 py-2 mt-2"
                    >
                      Entrar
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}
