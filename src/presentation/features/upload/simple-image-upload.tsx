/**
 * Simple Image Upload Component
 * Upload basique pour l'ajout d'images lors de la création de projet
 */

"use client";

import { useCallback } from "react";
import { Card } from "@/presentation/shared/ui/card";
import { Button } from "@/presentation/shared/ui/button";
import Image from "next/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface SimpleImageFile {
  id: string;
  file: File;
  preview: string;
}

interface SimpleImageUploadProps {
  files: SimpleImageFile[];
  onFilesAdded: (files: SimpleImageFile[]) => void;
  onFileRemoved: (id: string) => void;
  maxFiles?: number;
  singleImage?: boolean; // Mode image unique
}

export function SimpleImageUpload({
  files,
  onFilesAdded,
  onFileRemoved,
  maxFiles = 10,
  singleImage = false,
}: SimpleImageUploadProps) {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);

      // Mode image unique : remplacer l'image existante
      if (singleImage) {
        if (selectedFiles.length > 0) {
          // Libérer l'ancienne preview
          files.forEach(f => URL.revokeObjectURL(f.preview));

          const newFile: SimpleImageFile = {
            id: crypto.randomUUID(),
            file: selectedFiles[0],
            preview: URL.createObjectURL(selectedFiles[0]),
          };

          onFilesAdded([newFile]);
        }
      } else {
        // Mode multiple images
        if (files.length + selectedFiles.length > maxFiles) {
          alert(`Vous ne pouvez ajouter que ${maxFiles} images maximum`);
          return;
        }

        const newFiles: SimpleImageFile[] = selectedFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
        }));

        onFilesAdded(newFiles);
      }

      // Reset input
      e.target.value = "";
    },
    [files, maxFiles, onFilesAdded, singleImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      const imageFiles = droppedFiles.filter((file) =>
        file.type.startsWith("image/")
      );

      // Mode image unique
      if (singleImage) {
        if (imageFiles.length > 0) {
          files.forEach(f => URL.revokeObjectURL(f.preview));

          const newFile: SimpleImageFile = {
            id: crypto.randomUUID(),
            file: imageFiles[0],
            preview: URL.createObjectURL(imageFiles[0]),
          };

          onFilesAdded([newFile]);
        }
      } else {
        // Mode multiple
        if (files.length + imageFiles.length > maxFiles) {
          alert(`Vous ne pouvez ajouter que ${maxFiles} images maximum`);
          return;
        }

        const newFiles: SimpleImageFile[] = imageFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
        }));

        onFilesAdded(newFiles);
      }
    },
    [files, maxFiles, onFilesAdded, singleImage]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative"
      >
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          multiple={!singleImage}
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="image-upload" className="cursor-pointer block">
          <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 transition-colors p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-md bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                <Upload className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {singleImage
                  ? files.length > 0 ? "Changer la photo" : "Ajouter une photo de couverture"
                  : "Ajouter des photos"}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {singleImage
                  ? "Une belle photo qui représente votre projet"
                  : "Glissez-déposez vos images ou cliquez pour parcourir"}
              </p>
              <Button type="button" variant="outline" className="pointer-events-none">
                <ImageIcon size={16} className="mr-2" />
                Parcourir
              </Button>
              <p className="text-xs text-slate-500 mt-4">
                {singleImage
                  ? "PNG, JPG jusqu'à 10 MB"
                  : `${files.length} / ${maxFiles} images · PNG, JPG jusqu'à 10 MB`}
              </p>
            </div>
          </Card>
        </label>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.id} className="relative group">
              <div className="aspect-square rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={file.preview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onFileRemoved(file.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-md bg-red-600 hover:bg-red-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="text-white" size={16} />
              </button>

              {/* File name */}
              <p className="text-xs text-slate-600 mt-1 truncate">
                {file.file.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
