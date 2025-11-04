export type TransformationType =
  | "depersonnalisation" // Enlever les meubles
  | "depersonnalisation_premium" // Dépersonnalisation avec murs blancs et plancher de base
  | "home_staging_moderne" // Style moderne
  | "home_staging_scandinave" // Style scandinave
  | "home_staging_industriel" // Style industriel
  | "renovation_luxe" // Rénovation luxe
  | "renovation_contemporaine" // Rénovation contemporaine
  | "style_personnalise" // Style personnalisé avec prompt libre
  | string; // Pour les styles personnalisés créés par l'utilisateur (préfixe "custom_")

export type ImageStatus = "pending" | "processing" | "completed" | "failed";

export type RoomType =
  // Pièces de vie
  | "salon"
  | "cuisine"
  | "salle_a_manger"
  // Chambres
  | "chambre"
  | "chambre_enfant"
  // Pièces d'eau
  | "salle_de_bain"
  | "wc"
  | "toilette"
  // Travail et rangement
  | "bureau"
  | "dressing"
  | "buanderie"
  // Circulation
  | "entree"
  | "couloir"
  // Espaces extérieurs
  | "terrasse"
  | "balcon"
  | "jardin"
  | "veranda"
  // Stockage
  | "garage"
  | "cave"
  | "grenier"
  // Spéciaux
  | "mezzanine"
  | "salle_de_jeux"
  | "autre";

export interface ImagePair {
  id: string;
  originalUrl: string;
  transformedUrl?: string;
  transformationType: TransformationType;
  status: ImageStatus;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  wasGenerated?: boolean; // true si l'image a déjà été générée au moins une fois
  withFurniture?: boolean; // true = avec meubles, false = sans meubles
  customPrompt?: string; // Prompt personnalisé pour style_personnalise
  roomType?: RoomType; // Type de pièce
  customRoom?: string; // Nom personnalisé si roomType = "autre"
}

export interface Project {
  id: string;
  name: string;
  address?: string;
  description?: string;
  coverImage?: string;
  images: ImagePair[];
  createdAt: Date;
  updatedAt: Date;
  totalImages: number;
  completedImages: number;
  pendingImages: number;
  // Showcase fields
  slug?: string;
  isPublic?: boolean;
  viewCount?: number;
  lastViewedAt?: Date;
}

export interface DashboardStats {
  totalProjects: number;
  totalImages: number;
  imagesThisMonth: number;
  creditsRemaining: number;
}

export interface CustomStyle {
  id: string;
  name: string;
  description: string;
  iconName: string; // Nom de l'icône Lucide (ex: "Sofa", "Bed", "Lamp")
  createdAt: string | Date;
  updatedAt: string | Date;
}
