import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demo - Sofia AI Coach | Sistema de Coaching com Claude AI",
  description:
    "Experimente nosso sistema completo de coaching com IA Claude, streaming em tempo real e personas especializadas.",
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
