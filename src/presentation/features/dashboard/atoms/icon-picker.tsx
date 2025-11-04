"use client";

import { Button } from "@/presentation/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/presentation/shared/ui/dropdown-menu";
import {
  Sofa, Bed, Lamp, Coffee, Armchair, Bath, Utensils, Trees,
  Home, Flower2, Palette, Waves, Sun, Moon, Star, Heart, Sparkles,
  type LucideIcon,
} from "lucide-react";

export const AVAILABLE_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: "Sparkles", icon: Sparkles },
  { name: "Sofa", icon: Sofa },
  { name: "Bed", icon: Bed },
  { name: "Lamp", icon: Lamp },
  { name: "Coffee", icon: Coffee },
  { name: "Armchair", icon: Armchair },
  { name: "Bath", icon: Bath },
  { name: "Utensils", icon: Utensils },
  { name: "Trees", icon: Trees },
  { name: "Home", icon: Home },
  { name: "Flower2", icon: Flower2 },
  { name: "Palette", icon: Palette },
  { name: "Waves", icon: Waves },
  { name: "Sun", icon: Sun },
  { name: "Moon", icon: Moon },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
];

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  const SelectedIconComponent = AVAILABLE_ICONS.find((i) => i.name === selectedIcon)?.icon || Sparkles;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" type="button" className="w-full justify-start">
          <SelectedIconComponent size={18} className="mr-2" />
          {selectedIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
        {AVAILABLE_ICONS.map((iconOption) => {
          const IconComponent = iconOption.icon;
          return (
            <DropdownMenuItem
              key={iconOption.name}
              onClick={() => onSelectIcon(iconOption.name)}
            >
              <IconComponent size={18} className="mr-2" />
              {iconOption.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
