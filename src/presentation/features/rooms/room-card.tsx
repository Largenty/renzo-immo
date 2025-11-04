import { Card } from "@/presentation/shared/ui/card";
import { Button } from "@/presentation/shared/ui/button";
import { Badge } from "@/presentation/shared/ui/badge";
import { Edit, Trash2, Ruler, Home } from "lucide-react";
import type { RoomSpecification } from "@/domain/rooms/models/room";
import { ROOM_TYPE_LABELS } from "@/domain/rooms/models/room";
import {
  Sofa,
  BedDouble,
  ChefHat,
  Utensils,
  ShowerHead,
  Bath,
  Briefcase,
  DoorOpen,
  ArrowRight,
  Sun,
  Trees,
  Car,
  Wine,
  Package,
  WashingMachine,
  Shirt,
  Flower2,
  Layers,
  HelpCircle,
} from "lucide-react";

// Map des icônes Lucide
const iconMap: Record<string, any> = {
  Sofa,
  BedDouble,
  ChefHat,
  Utensils,
  ShowerHead,
  Bath,
  Briefcase,
  DoorOpen,
  ArrowRight,
  Sun,
  Home,
  Trees,
  Car,
  Wine,
  Package,
  WashingMachine,
  Shirt,
  Flower2,
  Layers,
  HelpCircle,
};

interface RoomCardProps {
  room: RoomSpecification;
  variant?: "default" | "user";
  canEdit?: boolean;
  onEdit?: (room: RoomSpecification) => void;
  onDelete?: (id: string) => void;
}

export function RoomCard({
  room,
  variant = "default",
  canEdit = false,
  onEdit,
  onDelete,
}: RoomCardProps) {
  const label = ROOM_TYPE_LABELS[room.room_type];
  const IconComponent = label?.icon ? iconMap[label.icon] : Home;

  const gradientColors =
    variant === "user"
      ? "from-green-500 to-emerald-500"
      : "from-blue-500 to-indigo-500";

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradientColors} flex items-center justify-center text-white`}
          >
            <IconComponent size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              {room.display_name_fr}
            </h3>
            <p className="text-sm text-slate-500">{room.display_name_en}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{room.room_type}</Badge>
        </div>

        {room.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {room.description}
          </p>
        )}

        {(room.typical_area_min || room.typical_area_max) && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Ruler size={16} />
            <span>
              {room.typical_area_min && `${room.typical_area_min}m²`}
              {room.typical_area_min && room.typical_area_max && " - "}
              {room.typical_area_max && `${room.typical_area_max}m²`}
            </span>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(room)}
          >
            <Edit size={16} className="mr-2" />
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(room.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )}
    </Card>
  );
}
