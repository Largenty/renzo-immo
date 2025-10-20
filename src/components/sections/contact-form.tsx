"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  return (
    <section id="contact" className="py-24 gradient-bg-2">
      <div className="container max-w-2xl">
        <Card className="bg-white border-blue-200/50 shadow-2xl shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              <span className="gradient-text">Une question ? Parlons-en</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Nom</Label>
                  <Input id="name" placeholder="Jean Dupont" className="bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input id="email" type="email" placeholder="jean@agence.fr" className="bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400" />
                </div>
              </div>
              <div>
                <Label htmlFor="message" className="text-gray-700">Message</Label>
                <Textarea id="message" placeholder="Votre message..." rows={5} className="bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400" />
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white">Envoyer</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
