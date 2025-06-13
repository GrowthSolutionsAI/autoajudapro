"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, Mail, MessageSquare } from "lucide-react"

export default function HelpSupport() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="text-center">
            <HelpCircle className="mx-auto h-8 w-8 text-blue-500" />
            <CardTitle>Base de Conhecimento</CardTitle>
            <CardDescription>Acesse nossa documentação e tutoriais</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline">Acessar Documentação</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-blue-500" />
            <CardTitle>Chat de Suporte</CardTitle>
            <CardDescription>Converse com nossa equipe de suporte</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline">Iniciar Chat</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <Mail className="mx-auto h-8 w-8 text-blue-500" />
            <CardTitle>Email de Suporte</CardTitle>
            <CardDescription>Envie um email para nossa equipe</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline">Enviar Email</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
          <CardDescription>Respostas para as dúvidas mais comuns</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Como adicionar um novo usuário?</AccordionTrigger>
              <AccordionContent>
                Para adicionar um novo usuário, vá até a seção "Usuários" e clique no botão "Adicionar Usuário".
                Preencha os campos necessários e clique em "Salvar".
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Como alterar o preço da assinatura?</AccordionTrigger>
              <AccordionContent>
                Para alterar o preço da assinatura, vá até a seção "Configurações" &gt; "Pagamento" e altere o valor no
                campo "Preço da Assinatura". Lembre-se de clicar em "Salvar Alterações" para aplicar as mudanças.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Como exportar dados de usuários?</AccordionTrigger>
              <AccordionContent>
                Para exportar dados de usuários, vá até a seção "Usuários" e clique no botão "Exportar" no canto
                superior direito da tabela. Você pode escolher exportar em formato CSV ou Excel.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Como configurar notificações por email?</AccordionTrigger>
              <AccordionContent>
                Para configurar notificações por email, vá até a seção "Configurações" > "Notificações" e ative ou
                desative as opções desejadas. Você pode configurar notificações para novos usuários, novas assinaturas,
                cancelamentos, etc.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Como alterar a personalidade da Sofia?</AccordionTrigger>
              <AccordionContent>
                Para alterar a personalidade da Sofia, vá até a seção "Configurações" > "Geral" > "Configurações da IA"
                e selecione a personalidade desejada no campo "Personalidade". As opções disponíveis são: Empática,
                Profissional, Amigável e Motivacional.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entre em Contato</CardTitle>
          <CardDescription>Envie uma mensagem para nossa equipe de suporte</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Seu email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input id="subject" placeholder="Assunto da mensagem" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea id="message" placeholder="Descreva sua dúvida ou problema" rows={5} />
            </div>
            <Button type="submit">Enviar Mensagem</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
