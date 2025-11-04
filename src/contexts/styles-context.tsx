"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { CustomStyle } from "@/../types/dashboard";

// Mock initial styles
const initialStyles: CustomStyle[] = [
  {
    id: "1",
    name: "Style Bohème",
    description: "Beaucoup de plantes, coussins colorés, tapis berbère, ambiance chaleureuse",
    iconName: "Flower2",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "2",
    name: "Minimaliste Japonais",
    description: "Lignes épurées, bois naturel, peu de meubles, tons neutres",
    iconName: "Moon",
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-12"),
  },
];

interface StylesContextType {
  styles: CustomStyle[];
  addStyle: (style: CustomStyle) => void;
  updateStyle: (id: string, updates: Partial<CustomStyle>) => void;
  deleteStyle: (id: string) => void;
}

const StylesContext = createContext<StylesContextType | undefined>(undefined);

export function StylesProvider({ children }: { children: ReactNode }) {
  const [styles, setStyles] = useState<CustomStyle[]>(initialStyles);

  const addStyle = (style: CustomStyle) => {
    setStyles((prev) => [style, ...prev]);
  };

  const updateStyle = (id: string, updates: Partial<CustomStyle>) => {
    setStyles((prev) =>
      prev.map((style) =>
        style.id === id ? { ...style, ...updates, updatedAt: new Date() } : style
      )
    );
  };

  const deleteStyle = (id: string) => {
    setStyles((prev) => prev.filter((style) => style.id !== id));
  };

  return (
    <StylesContext.Provider value={{ styles, addStyle, updateStyle, deleteStyle }}>
      {children}
    </StylesContext.Provider>
  );
}

export function useStyles() {
  const context = useContext(StylesContext);
  if (context === undefined) {
    throw new Error("useStyles must be used within a StylesProvider");
  }
  return context;
}
