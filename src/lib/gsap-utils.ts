"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// 🔧 FIX: Lazy initialization to prevent SSR errors
let isInitialized = false;

function initGsap() {
  if (typeof window !== "undefined" && !isInitialized) {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    isInitialized = true;
  }
}

// Auto-initialize on first import in browser
if (typeof window !== "undefined") {
  initGsap();
}

export { gsap, ScrollTrigger, ScrollToPlugin };

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollTo(target: string | HTMLElement, offset = -80) {
  gsap.to(window, {
    duration: 1,
    scrollTo: { y: target, offsetY: offset },
    ease: "power3.inOut",
  });
}
