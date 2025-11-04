"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Loader2, X, Grid3x3, SlidersHorizontal } from "lucide-react";
import { Button } from "@/presentation/shared/ui/button";

interface TransformationType {
  name: string;
  description: string;
  iconName: string | null;
}

interface ShowcaseImage {
  id: string;
  originalUrl: string;
  transformedUrl: string;
  roomType: string | null;
  customRoom: string | null;
  transformationType: TransformationType | null;
  createdAt: string;
}

interface ShowcaseData {
  project: {
    id: string;
    name: string;
    slug: string;
    coverImage: string | null;
    totalImages: number;
    completedImages: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
  };
  owner: {
    displayName: string;
    firstName: string;
    lastName: string;
    company: string | null;
    avatarUrl: string | null;
  };
  images: ShowcaseImage[];
}

type ViewMode = "slider" | "gallery";

export default function ShowcasePage() {
  const params = useParams();
  const username = params?.username as string;
  const slug = params?.slug as string;

  const [data, setData] = useState<ShowcaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("slider");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Fetch showcase data
  useEffect(() => {
    if (!username || !slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/showcase/${username}/${slug}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Impossible de charger les données");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, slug]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data?.images.length || viewMode !== "slider") return;

      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : data.images.length - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < data.images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, viewMode]);

  // Handle slider drag
  const updateSliderPosition = (clientX: number) => {
    if (!sliderContainerRef.current) return;

    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!isDragging) return;
    const touch = 'touches' in e ? e.touches[0] : null;
    if (touch) {
      updateSliderPosition(touch.clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Global mouse/touch listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove as any);
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove as any);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove as any);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Projet introuvable</h1>
          <p className="text-slate-600 mb-6">
            {error || "Ce projet n'existe pas ou n'est pas accessible publiquement."}
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const hasImages = data.images.length > 0;
  const currentImage = hasImages ? data.images[currentIndex] : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Project info */}
            <div className="flex-shrink min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                {data.project.name}
              </h1>
              <p className="text-xs text-slate-600 truncate">
                Par {data.owner.company || `${data.owner.firstName} ${data.owner.lastName}`}
              </p>
            </div>

            {/* Right: Stats + View Toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Stats - hidden on mobile */}
              <div className="text-right hidden md:block mr-2">
                <p className="text-sm text-slate-700 whitespace-nowrap">
                  {data.project.completedImages} photo{data.project.completedImages > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-slate-500 whitespace-nowrap">
                  {data.project.viewCount} vue{data.project.viewCount > 1 ? "s" : ""}
                </p>
              </div>

              {/* View Mode Toggle */}
              {hasImages && (
                <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("slider")}
                    className={`px-2 md:px-3 py-1.5 md:py-2 rounded-md transition-all flex items-center gap-1 text-xs font-medium whitespace-nowrap ${
                      viewMode === "slider"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span className="hidden sm:inline">Comparaison</span>
                  </button>
                  <button
                    onClick={() => setViewMode("gallery")}
                    className={`px-2 md:px-3 py-1.5 md:py-2 rounded-md transition-all flex items-center gap-1 text-xs font-medium whitespace-nowrap ${
                      viewMode === "gallery"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Grid3x3 size={14} />
                    <span className="hidden sm:inline">Galerie</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {!hasImages ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📸</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Aucune image disponible</h2>
            <p className="text-slate-600">
              Ce projet ne contient pas encore d'images transformées.
            </p>
          </div>
        </div>
      ) : (
        <main>
          {viewMode === "slider" && currentImage ? (
            <div className="max-w-7xl mx-auto px-6 py-12">
              {/* Before/After Slider */}
              <div
                ref={sliderContainerRef}
                className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200 mb-8 cursor-ew-resize select-none"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleMouseDown();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleTouchStart();
                }}
              >
                {/* After Image (Transformed) */}
                <div className="absolute inset-0 pointer-events-none">
                  <Image
                    src={currentImage.transformedUrl}
                    alt="Après transformation"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    draggable={false}
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg pointer-events-none">
                    Après
                  </div>
                </div>

                {/* Before Image (Original) with clip-path */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                  }}
                >
                  <Image
                    src={currentImage.originalUrl}
                    alt="Avant transformation"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    draggable={false}
                  />
                  <div className="absolute top-4 left-4 bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-lg pointer-events-none">
                    Avant
                  </div>
                </div>

                {/* Slider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-blue-600 shadow-2xl z-20 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-2 border-blue-600 rounded-full shadow-xl flex items-center justify-center">
                    <div className="flex items-center gap-0.5">
                      <div className="w-1 h-6 bg-blue-600 rounded"></div>
                      <div className="w-1 h-6 bg-blue-600 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Info */}
              {currentImage.transformationType && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {currentImage.transformationType.name}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {currentImage.transformationType.description}
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : data.images.length - 1))
                  }
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Précédent
                </Button>

                <div className="text-center">
                  <p className="text-slate-900 font-semibold">
                    {currentIndex + 1} / {data.images.length}
                  </p>
                </div>

                <Button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev < data.images.length - 1 ? prev + 1 : 0))
                  }
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            /* Gallery View - Professional Real Estate */
            <div className="space-y-1">
              {data.images.map((image, index) => {
                // Alterner les layouts pour créer un rythme visuel
                const isEven = index % 2 === 0;
                const isLarge = index % 3 === 0; // Chaque 3ème image est plus grande

                if (isLarge) {
                  // Layout pleine largeur alterné
                  return (
                    <div key={image.id} className="space-y-1">
                      {/* Grande image "après" en premier pour impact */}
                      <div className="relative aspect-[21/9] bg-black">
                        <Image
                          src={image.transformedUrl}
                          alt="Après transformation"
                          fill
                          className="object-cover"
                          sizes="100vw"
                          priority={index === 0}
                        />
                      </div>
                      {/* Petite image "avant" en dessous */}
                      <div className="relative aspect-[21/9] md:aspect-[32/9] bg-black">
                        <Image
                          src={image.originalUrl}
                          alt="Avant transformation"
                          fill
                          className="object-cover"
                          sizes="100vw"
                        />
                      </div>
                    </div>
                  );
                }

                // Layout 2 colonnes standard avec ordre alterné
                return (
                  <div key={image.id} className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {isEven ? (
                      <>
                        {/* Avant à gauche */}
                        <div className="relative aspect-[16/10] bg-black">
                          <Image
                            src={image.originalUrl}
                            alt="Avant transformation"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                        {/* Après à droite */}
                        <div className="relative aspect-[16/10] bg-black">
                          <Image
                            src={image.transformedUrl}
                            alt="Après transformation"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Après à gauche pour alterner */}
                        <div className="relative aspect-[16/10] bg-black">
                          <Image
                            src={image.transformedUrl}
                            alt="Après transformation"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                        {/* Avant à droite */}
                        <div className="relative aspect-[16/10] bg-black">
                          <Image
                            src={image.originalUrl}
                            alt="Avant transformation"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 text-sm">
            Transformations réalisées avec{" "}
            <span className="text-slate-900 font-semibold">Renzo</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
