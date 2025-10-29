import { Card } from "@/components/ui/card";

interface Tip {
  text: string;
}

interface TipsListProps {
  title: string;
  tips: Tip[];
}

export function TipsList({ title, tips }: TipsListProps) {
  return (
    <Card className="modern-card p-6 bg-slate-50 border-slate-200">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      <ul className="space-y-2 text-sm text-slate-700">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
