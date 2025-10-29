"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Building2, Phone, MapPin } from "lucide-react";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
}

interface ProfileSettingsSectionProps {
  initialData?: ProfileFormData;
  onSave?: (data: ProfileFormData) => void;
}

export function ProfileSettingsSection({
  initialData,
  onSave,
}: ProfileSettingsSectionProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    company: initialData?.company || "",
    address: initialData?.address || "",
  });

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="modern-card p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        Informations personnelles
      </h2>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div>
            <Button variant="outline" size="sm">
              Changer la photo
            </Button>
            <p className="text-xs text-slate-500 mt-2">
              JPG, PNG ou GIF. Max 2 MB.
            </p>
          </div>
        </div>

        <Separator />

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Votre prénom"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Votre nom"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-10"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="pl-10"
                placeholder="+33 6 XX XX XX XX"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company">Société (optionnel)</Label>
            <div className="relative">
              <Building2
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="pl-10"
                placeholder="Nom de votre société"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="pl-10 min-h-[80px]"
                placeholder="Votre adresse complète"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
