// Sistema básico de autenticação
export interface User {
  id: string
  name: string
  email: string
  isLoggedIn: boolean
  loginTime: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Gerar ID único para usuário
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Validar dados de login
export function validateLoginData(email: string, password: string): { isValid: boolean; error?: string } {
  if (!email || !password) {
    return { isValid: false, error: "Email e senha são obrigatórios" }
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: "Email inválido" }
  }

  if (password.length < 6) {
    return { isValid: false, error: "Senha deve ter pelo menos 6 caracteres" }
  }

  return { isValid: true }
}

// Sanitizar entrada do usuário
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}
