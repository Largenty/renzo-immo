"use client";

import { Card } from "@/presentation/shared/ui/card";
import { Button } from "@/presentation/shared/ui/button";
import { CreditCard, Trash2, Check } from "lucide-react";

interface BillingInfo {
  plan: string;
  monthlyAmount: string;
  nextBillingDate: string;
  creditsRemaining: string;
  creditsTotal: string;
}

interface PaymentMethod {
  last4: string;
  expiryDate: string;
}

interface Invoice {
  date: string;
  amount: string;
  status: string;
  invoiceNumber: string;
}

interface BillingSettingsSectionProps {
  billingInfo?: BillingInfo;
  paymentMethod?: PaymentMethod;
  invoices?: Invoice[];
  onChangePlan?: () => void;
  onCancelSubscription?: () => void;
  onUpdatePayment?: () => void;
  onDeletePayment?: () => void;
  onAddCard?: () => void;
  onDownloadInvoice?: (invoiceNumber: string) => void;
}

const defaultBillingInfo: BillingInfo = {
  plan: "Pro Plan",
  monthlyAmount: "79 €",
  nextBillingDate: "12 nov.",
  creditsRemaining: "48",
  creditsTotal: "120",
};

const defaultPaymentMethod: PaymentMethod = {
  last4: "4242",
  expiryDate: "12/2025",
};

const defaultInvoices: Invoice[] = [
  {
    date: "12 Oct 2024",
    amount: "79,00 €",
    status: "Payé",
    invoiceNumber: "#INV-2024-10-001",
  },
  {
    date: "12 Sep 2024",
    amount: "79,00 €",
    status: "Payé",
    invoiceNumber: "#INV-2024-09-001",
  },
  {
    date: "12 Août 2024",
    amount: "79,00 €",
    status: "Payé",
    invoiceNumber: "#INV-2024-08-001",
  },
];

export function BillingSettingsSection({
  billingInfo = defaultBillingInfo,
  paymentMethod = defaultPaymentMethod,
  invoices = defaultInvoices,
  onChangePlan,
  onCancelSubscription,
  onUpdatePayment,
  onDeletePayment,
  onAddCard,
  onDownloadInvoice,
}: BillingSettingsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="modern-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Forfait actuel</h2>
            <p className="text-slate-600 mt-1">
              Gérez votre abonnement et méthodes de paiement
            </p>
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold text-sm rounded-sm">
            {billingInfo.plan}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Montant mensuel</p>
            <p className="text-2xl font-bold text-slate-900">
              {billingInfo.monthlyAmount}
            </p>
          </div>
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Prochaine facture</p>
            <p className="text-2xl font-bold text-slate-900">
              {billingInfo.nextBillingDate}
            </p>
          </div>
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Crédits restants</p>
            <p className="text-2xl font-bold text-slate-900">
              {billingInfo.creditsRemaining} / {billingInfo.creditsTotal}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onChangePlan}>
            Changer de forfait
          </Button>
          <Button variant="outline" onClick={onCancelSubscription}>
            Annuler l&apos;abonnement
          </Button>
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="modern-card p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Méthode de paiement
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-md border border-slate-200 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <CreditCard size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  •••• •••• •••• {paymentMethod.last4}
                </p>
                <p className="text-sm text-slate-600">
                  Expire {paymentMethod.expiryDate}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onUpdatePayment}>
                Modifier
              </Button>
              <Button variant="ghost" size="sm" onClick={onDeletePayment}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={onAddCard}>
            <CreditCard size={18} className="mr-2" />
            Ajouter une carte
          </Button>
        </div>
      </Card>

      {/* Billing History */}
      <Card className="modern-card p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Historique de facturation
        </h2>

        <div className="space-y-3">
          {invoices.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center">
                  <Check size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.invoiceNumber}
                  </p>
                  <p className="text-sm text-slate-600">{item.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{item.amount}</p>
                  <p className="text-sm text-green-600">{item.status}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onDownloadInvoice && onDownloadInvoice(item.invoiceNumber)
                  }
                >
                  Télécharger
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
