"use client";

import { useState, useMemo } from "react";
import { useCurrentUser } from "@/domain/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Home,
  Trash2,
  Edit,
  Search,
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
  CheckCircle2,
  Ruler,
  Shield,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRoomsList, useDeleteRoom } from "@/domain/rooms/hooks/use-rooms";
import { RoomFormDialog } from "@/components/rooms/room-form-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import type { RoomSpecification } from "@/domain/rooms/models/room";
import { ROOM_TYPE_LABELS } from "@/domain/rooms/models/room";

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

export default function RoomsPage() {
  const { data: user } = useCurrentUser();
  const { data: roomsList = [], isLoading } = useRoomsList();
  const deleteRoomMutation = useDeleteRoom();

  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomSpecification | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [defaultSectionExpanded, setDefaultSectionExpanded] = useState(false);
  const [userSectionExpanded, setUserSectionExpanded] = useState(true);

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === "admin";

  // Séparer pièces par défaut et personnalisées
  const { defaultRooms, userRooms } = useMemo(() => {
    const filtered = roomsList.filter((room) => {
      const matchesSearch =
        room.display_name_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.display_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.room_type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });

    return {
      defaultRooms: filtered.filter((room) => !(room as any).user_id), // user_id = NULL
      userRooms: filtered.filter((room) => !!(room as any).user_id), // user_id = user.id
    };
  }, [roomsList, searchQuery]);

  // Vérifier si une pièce peut être modifiée/supprimée par le user
  const canEditRoom = (room: RoomSpecification) => {
    const roomUserId = (room as any).user_id;
    // Admin peut tout modifier, user peut modifier seulement ses pièces
    return isAdmin || roomUserId === user?.id;
  };

  const handleEdit = (room: RoomSpecification) => {
    setEditingRoom(room);
    setFormDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRoomMutation.mutateAsync(id);
      toast.success("Pièce supprimée avec succès");
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleFormClose = () => {
    setFormDialogOpen(false);
    setEditingRoom(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Types de Pièces</h1>
          <p className="text-slate-600 mt-2">
            Gérez les spécifications et contraintes architecturales pour chaque type de pièce
          </p>
        </div>
        <Button onClick={() => setFormDialogOpen(true)} className="gap-2">
          <Plus size={20} />
          Ajouter une pièce
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Rechercher une pièce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Home className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{roomsList.length}</p>
              <p className="text-sm text-slate-600">Pièces configurées</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{defaultRooms.length + userRooms.length}</p>
              <p className="text-sm text-slate-600">Résultats affichés</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Ruler className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {roomsList.filter(r => r.typical_area_min).length}
              </p>
              <p className="text-sm text-slate-600">Avec surface définie</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rooms List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : defaultRooms.length === 0 && userRooms.length === 0 ? (
        <Card className="p-12 text-center">
          <Home className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Aucune pièce trouvée
          </h3>
          <p className="text-slate-600 mb-6">
            {searchQuery
              ? "Aucune pièce ne correspond à votre recherche"
              : "Commencez par ajouter votre premier type de pièce"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setFormDialogOpen(true)}>
              <Plus size={20} className="mr-2" />
              Ajouter une pièce
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Section: Pièces par défaut */}
          {defaultRooms.length > 0 && (
            <div>
              <button
                onClick={() => setDefaultSectionExpanded(!defaultSectionExpanded)}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <Shield className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-slate-900">Pièces par défaut</h2>
                <Badge variant="secondary" className="ml-2">{defaultRooms.length}</Badge>
                {defaultSectionExpanded ? (
                  <ChevronUp className="text-slate-600 ml-auto" size={20} />
                ) : (
                  <ChevronDown className="text-slate-600 ml-auto" size={20} />
                )}
              </button>
              {defaultSectionExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defaultRooms.map((room) => {
                  const label = ROOM_TYPE_LABELS[room.room_type];
                  const IconComponent = label?.icon ? iconMap[label.icon] : Home;

                  return (
                    <Card key={room.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                            <IconComponent size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{room.display_name_fr}</h3>
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

                      {canEditRoom(room) && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(room)}
                          >
                            <Edit size={16} className="mr-2" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirmId(room.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
                </div>
              )}
            </div>
          )}

          {/* Section: Mes pièces personnalisées */}
          {userRooms.length > 0 && (
            <div className="rounded-lg border-2 border-green-200 bg-green-50/30 p-6">
              <button
                onClick={() => setUserSectionExpanded(!userSectionExpanded)}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <User className="text-green-600" size={24} />
                <h2 className="text-xl font-semibold text-slate-900">Mes pièces personnalisées</h2>
                <Badge variant="default" className="ml-2 bg-green-600">{userRooms.length}</Badge>
                {userSectionExpanded ? (
                  <ChevronUp className="text-slate-600 ml-auto" size={20} />
                ) : (
                  <ChevronDown className="text-slate-600 ml-auto" size={20} />
                )}
              </button>
              {userSectionExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRooms.map((room) => {
                  const label = ROOM_TYPE_LABELS[room.room_type];
                  const IconComponent = label?.icon ? iconMap[label.icon] : Home;

                  return (
                    <Card key={room.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                            <IconComponent size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{room.display_name_fr}</h3>
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

                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(room)}
                        >
                          <Edit size={16} className="mr-2" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmId(room.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <RoomFormDialog
        open={formDialogOpen}
        onClose={handleFormClose}
        room={editingRoom}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Supprimer cette pièce ?"
        description="Cette action est irréversible. Les spécifications de cette pièce seront retirées du système."
        isDeleting={deleteRoomMutation.isPending}
      />
    </div>
  );
}
