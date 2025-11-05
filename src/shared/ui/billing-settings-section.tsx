'use client'

import { Card, CardHeader, CardTitle, CardContent } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { CreditCard, Download } from 'lucide-react'

interface BillingSettingsSectionProps {
  onChangePlan: () => void
  onCancelSubscription: () => void
  onUpdatePayment: () => void
  onDeletePayment: () => void
  onAddCard: () => void
  onDownloadInvoice: (invoiceNumber: string) => void
}

export function BillingSettingsSection({
  onChangePlan,
  onCancelSubscription,
  onUpdatePayment,
  onDeletePayment,
  onAddCard,
  onDownloadInvoice,
}: BillingSettingsSectionProps) {
  // Demo data
  const currentPlan = {
    name: 'Formule Starter',
    price: '19€',
    period: 'mois',
    credits: 100,
  }

  const paymentMethods = [
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true,
    },
  ]

  const invoices = [
    {
      number: 'INV-2024-001',
      date: '01 Jan 2024',
      amount: '19,00€',
      status: 'paid',
    },
    {
      number: 'INV-2023-012',
      date: '01 Dec 2023',
      amount: '19,00€',
      status: 'paid',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Formule actuelle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{currentPlan.name}</h3>
              <p className="text-sm text-slate-600">
                {currentPlan.credits} crédits / mois
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {currentPlan.price}
                <span className="text-sm font-normal text-slate-600">
                  /{currentPlan.period}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onChangePlan} variant="outline" className="flex-1">
              Changer de formule
            </Button>
            <Button
              onClick={onCancelSubscription}
              variant="destructive"
              className="flex-1"
            >
              Résilier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Moyens de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-medium">
                    {method.type} •••• {method.last4}
                  </p>
                  <p className="text-sm text-slate-600">
                    Expire {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
                {method.isDefault && (
                  <Badge variant="secondary">Par défaut</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={onUpdatePayment} variant="outline" size="sm">
                  Modifier
                </Button>
                <Button
                  onClick={onDeletePayment}
                  variant="destructive"
                  size="sm"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={onAddCard} variant="outline" className="w-full">
            Ajouter une carte
          </Button>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Factures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.number}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-sm">{invoice.number}</p>
                    <p className="text-xs text-slate-600">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">{invoice.amount}</p>
                  <Badge
                    variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                  >
                    {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                  </Badge>
                  <Button
                    onClick={() => onDownloadInvoice(invoice.number)}
                    variant="ghost"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
