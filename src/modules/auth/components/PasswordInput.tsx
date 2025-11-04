"use client";

import { useState } from "react";
import { Input } from "@/presentation/shared/ui/input";
import { Button } from "@/presentation/shared/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PasswordInput({ value, onChange, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="pr-12"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff size={18} className="text-slate-400" />
        ) : (
          <Eye size={18} className="text-slate-400" />
        )}
      </Button>
    </div>
  );
}
