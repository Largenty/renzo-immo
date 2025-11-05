"use client";

import { Card, Button } from "@/shared";
import Link from "next/link";

export function ProjectNotFound() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Card className="modern-card p-12 text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Projet introuvable
        </h3>
        <p className="text-slate-600 mb-6">
          Le projet demandé n&apos;existe pas ou a été supprimé.
        </p>
        <Link href="/dashboard/projects">
          <Button>Retour aux projets</Button>
        </Link>
      </Card>
    </div>
  );
}
