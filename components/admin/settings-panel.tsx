"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPanel() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    // Simulação de salvamento
    setTimeout(() => {
      setSaving(false)
    }, 1000)
  }

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">Geral</TabsTrigger>
        <TabsTrigger value="payment">Pagamento</TabsTrigger>
        <TabsTrigger value="notifications">Notificações</TabsTrigger>
        <TabsTrigger value="security">Segurança</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Gerencie as configurações gerais da plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Nome do Site</Label>
              <Input id="site-name" defaultValue="AutoAjuda Pro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-description">Descrição do Site</Label>
              <Textarea
                id="site-description"
                defaultValue="Plataforma de autoajuda com IA especialista em desenvolvimento pessoal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email de Contato</Label>
              <Input id="contact-email" type="email" defaultValue="contato@autoajudapro.com" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="maintenance-mode" />
              <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações da IA</CardTitle>
            <CardDescription>Personalize o comportamento da Sofia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-name">Nome da IA</Label>
              <Input id="ai-name" defaultValue="Sofia" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-description">Descrição da IA</Label>
              <Textarea id="ai-description" defaultValue="IA Especialista em Autoajuda" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-personality">Personalidade</Label>
              <Select defaultValue="empathetic">
                <SelectTrigger id="ai-personality">
                  <SelectValue placeholder="Selecione uma personalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empathetic">Empática</SelectItem>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="friendly">Amigável</SelectItem>
                  <SelectItem value="motivational">Motivacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="free-messages">Mensagens Gratuitas</Label>
              <Input id="free-messages" type="number" defaultValue="5" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="payment" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Pagamento</CardTitle>
            <CardDescription>Gerencie as configurações de pagamento da plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-gateway">Gateway de Pagamento</Label>
              <Select defaultValue="pagseguro">
                <SelectTrigger id="payment-gateway">
                  <SelectValue placeholder="Selecione um gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pagseguro">PagSeguro</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pagseguro-email">Email PagSeguro</Label>
              <Input id="pagseguro-email" defaultValue="diego.souza44@gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pagseguro-token">Token PagSeguro</Label>
              <Input id="pagseguro-token" type="password" defaultValue="********" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscription-price">Preço da Assinatura (R$)</Label>
              <Input id="subscription-price" defaultValue="19.90" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="test-mode" defaultChecked />
              <Label htmlFor="test-mode">Modo de Teste</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Notificações</CardTitle>
            <CardDescription>Gerencie as notificações enviadas pela plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-user">Novo Usuário</Label>
                <p className="text-sm text-muted-foreground">Receba notificações quando um novo usuário se registrar</p>
              </div>
              <Switch id="new-user" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-subscription">Nova Assinatura</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações quando uma nova assinatura for realizada
                </p>
              </div>
              <Switch id="new-subscription" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="canceled-subscription">Assinatura Cancelada</Label>
                <p className="text-sm text-muted-foreground">Receba notificações quando uma assinatura for cancelada</p>
              </div>
              <Switch id="canceled-subscription" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payment-failed">Pagamento Falhou</Label>
                <p className="text-sm text-muted-foreground">Receba notificações quando um pagamento falhar</p>
              </div>
              <Switch id="payment-failed" defaultChecked />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Segurança</CardTitle>
            <CardDescription>Gerencie as configurações de segurança da plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Nome de Usuário Admin</Label>
              <Input id="admin-username" defaultValue="admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Senha Admin</Label>
              <Input id="admin-password" type="password" defaultValue="********" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input id="confirm-password" type="password" defaultValue="********" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="two-factor" />
              <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
