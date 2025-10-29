"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, LucideIcon } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerClassName?: string;
}

export function ActionMenu({ items, triggerClassName = "" }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${triggerClassName}`}
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === items.length - 1;
          const isDestructive = item.variant === "destructive";

          return (
            <div key={item.label}>
              <DropdownMenuItem
                onClick={item.onClick}
                className={isDestructive ? "text-red-600 focus:text-red-600" : ""}
              >
                <Icon size={16} className="mr-2" />
                {item.label}
              </DropdownMenuItem>
              {!isLast && isDestructive && <DropdownMenuSeparator />}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
