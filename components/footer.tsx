import { Heart, Facebook, Instagram, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ]

  const footerLinks = [
    {
      title: "Produto",
      links: [
        { name: "Como Funciona", href: "#como-funciona" },
        { name: "Planos", href: "#planos" },
        { name: "Especialistas", href: "#" },
        { name: "Recursos", href: "#" },
      ],
    },
    {
      title: "Suporte",
      links: [
        { name: "Central de Ajuda", href: "#" },
        { name: "FAQ", href: "#faq" },
        { name: "Contato", href: "#contato" },
        { name: "Status", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Termos de Uso", href: "#" },
        { name: "Política de Privacidade", href: "#" },
        { name: "Cookies", href: "#" },
        { name: "LGPD", href: "#" },
      ],
    },
  ]

  return (
    <footer id="contato" className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">AutoAjuda Pro</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Conectando você com especialistas em autoajuda para uma vida mais plena e equilibrada. Sua jornada de
              transformação pessoal começa aqui.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 AutoAjuda Pro. Todos os direitos reservados.</p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">Feito com ❤️ para transformar vidas</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
