import Image from "next/image";
import { Clock, AlertCircle, Loader2 } from "lucide-react";
import type { StatusType } from "./status-badge";
import { memo } from "react";

interface ImageComparisonProps {
  originalUrl: string;
  transformedUrl?: string;
  status: StatusType;
  altOriginal?: string;
  altTransformed?: string;
}

export const ImageComparison = memo(function ImageComparison({
  originalUrl,
  transformedUrl,
  status,
  altOriginal = "Image originale",
  altTransformed = "Image transformée",
}: ImageComparisonProps) {
  return (
    <div className="grid grid-cols-2 gap-0">
      {/* Image originale */}
      <div className="relative h-48 bg-slate-100">
        <Image
          src={originalUrl}
          alt={altOriginal}
          fill
          loading="lazy"
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute top-2 left-2 px-2 py-1 glass text-xs font-semibold">
          Avant
        </div>
      </div>

      {/* Image transformée */}
      <div className="relative h-48 bg-slate-100">
        {transformedUrl ? (
          <>
            <Image
              src={transformedUrl}
              alt={altTransformed}
              fill
              loading="lazy"
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute top-2 right-2 px-2 py-1 glass text-xs font-semibold">
              Après
            </div>
          </>
        ) : status === "processing" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-sm animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">
                Génération...
              </p>
              <p className="text-[10px] text-slate-500 mt-1">~2m 47s</p>
            </div>
          </div>
        ) : status === "failed" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center">
              <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
              <p className="text-xs text-red-700 font-medium">Échec</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <Clock size={24} className="text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">En attente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
