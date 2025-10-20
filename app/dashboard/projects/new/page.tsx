"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Sparkles, FolderPlus } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Create project via API
    console.log("Creating project:", formData);
    // Redirect to project detail
    router.push("/dashboard/projects/1");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/projects">
          <Button variant="ghost" className="mb-4 text-slate-600 hover:text-slate-900">
            <ArrowLeft size={16} className="mr-2" />
            Retour aux projets
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Créer un nouveau projet</h1>
        <p className="text-slate-600 mt-1">
          Organisez vos transformations d'images par projet
        </p>
      </div>

      {/* Form */}
      <Card className="modern-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-semibold">
              Nom du projet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ex: Villa Moderne - Cannes"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-12 bg-white border-slate-300 text-slate-900"
            />
            <p className="text-sm text-slate-500">
              Donnez un nom descriptif à votre projet
            </p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-slate-700 font-semibold">
              Adresse du bien
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Ex: 45 Boulevard de la Croisette, Cannes"
              value={formData.address}
              onChange={handleChange}
              className="h-12 bg-white border-slate-300 text-slate-900"
            />
            <p className="text-sm text-slate-500">
              L'adresse complète du bien immobilier (optionnel)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Ex: Rénovation complète d'une villa moderne de 250m²"
              value={formData.description}
              onChange={handleChange}
              className="min-h-[120px] bg-white border-slate-300 text-slate-900 resize-none"
            />
            <p className="text-sm text-slate-500">
              Notes ou informations complémentaires (optionnel)
            </p>
          </div>

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Prochaine étape
                </h3>
                <p className="text-sm text-slate-700">
                  Après la création du projet, vous pourrez ajouter vos photos et
                  choisir le type de transformation (dépersonnalisation, home staging,
                  rénovation...).
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
            <Link href="/dashboard/projects" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-slate-300"
              >
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow"
              disabled={!formData.name}
            >
              <FolderPlus size={20} className="mr-2" />
              Créer le projet
            </Button>
          </div>
        </form>
      </Card>

      {/* Tips */}
      <Card className="modern-card p-6 bg-slate-50 border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Conseils pour organiser vos projets
        </h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Créez un projet par bien immobilier pour une meilleure organisation
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Utilisez des noms clairs et descriptifs (ville, type de bien...)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Ajoutez l'adresse pour retrouver facilement vos projets
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
