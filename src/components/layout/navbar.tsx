"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { gsap } from "@/lib/gsap-utils";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Renzo
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#comment-ca-marche" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Comment ça marche
          </a>
          <a href="#tarifs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Tarifs
          </a>
          <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Contact
          </a>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            Tester gratuitement
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="container py-4 space-y-4">
            <a href="#comment-ca-marche" className="block py-2 text-sm font-medium text-gray-600">
              Comment ça marche
            </a>
            <a href="#tarifs" className="block py-2 text-sm font-medium text-gray-600">
              Tarifs
            </a>
            <a href="#contact" className="block py-2 text-sm font-medium text-gray-600">
              Contact
            </a>
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Tester gratuitement
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
