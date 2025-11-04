"use client";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 8)
      return { label: "Faible", color: "bg-red-500", width: "33%" };
    if (password.length < 12)
      return { label: "Moyen", color: "bg-orange-500", width: "66%" };
    return { label: "Fort", color: "bg-green-500", width: "100%" };
  };

  const strength = getStrength();

  if (!strength) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600">Force du mot de passe</span>
        <span
          className={`font-medium ${
            strength.label === "Faible"
              ? "text-red-600"
              : strength.label === "Moyen"
              ? "text-orange-600"
              : "text-green-600"
          }`}
        >
          {strength.label}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-300`}
          style={{ width: strength.width }}
        />
      </div>
    </div>
  );
}
