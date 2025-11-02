"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart } from "lucide-react";

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular: boolean;
}

interface CreditPackCardProps {
  pack: CreditPack;
  isProcessing: boolean;
  onBuy: (packId: string, packName: string) => void;
}

export const CreditPackCard = memo(function CreditPackCard({ pack, isProcessing, onBuy }: CreditPackCardProps) {
  return (
    <Card
      className={`modern-card p-6 relative ${
        pack.popular
          ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2"
          : ""
      }`}
    >
      {pack.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-sm">
          POPULAIRE
        </div>
      )}

      <div className="text-center mb-6">
        <div className="inline-flex w-16 h-16 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center mb-4">
          <Package className="text-white" size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">{pack.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-slate-900">{pack.credits}</span>
          <span className="text-slate-600">crédits</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Prix total</span>
          <span className="font-semibold text-slate-900">{pack.price}€</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Prix/crédit</span>
          <span className="font-semibold text-blue-600">{pack.pricePerCredit}€</span>
        </div>
      </div>

      <Button
        onClick={() => onBuy(pack.id, pack.name)}
        disabled={isProcessing}
        className={`w-full ${
          pack.popular
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            : ""
        }`}
        variant={pack.popular ? "default" : "outline"}
      >
        {isProcessing ? (
          "Traitement..."
        ) : (
          <>
            <ShoppingCart size={16} className="mr-2" />
            Acheter
          </>
        )}
      </Button>
    </Card>
  );
});
