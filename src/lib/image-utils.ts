/**
 * Utilitaires pour la manipulation d'images
 * Compression, redimensionnement, conversion de format
 */

/**
 * Options pour la compression d'images
 */
export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Résultat de la compression
 */
export interface CompressedImage {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Compresser une image côté client avant upload
 *
 * @param file - Fichier image à compresser
 * @param options - Options de compression
 * @returns Image compressée avec métadonnées
 *
 * @example
 * ```tsx
 * const compressed = await compressImage(file, {
 *   maxWidth: 1920,
 *   maxHeight: 1080,
 *   quality: 0.85,
 *   format: 'jpeg'
 * });
 * logger.debug(`Taille réduite de ${compressed.compressionRatio}%`);
 * ```
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<CompressedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions en conservant le ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Créer un canvas pour redimensionner
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en Blob avec compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Créer un nouveau File depuis le Blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`),
              {
                type: `image/${format}`,
                lastModified: Date.now(),
              }
            );

            const compressionRatio = Math.round(
              ((file.size - blob.size) / file.size) * 100
            );

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio,
              dimensions: { width, height },
            });
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Vérifier si un fichier est une image valide
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Vérifier la taille du fichier
 */
export function isFileSizeValid(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Formater la taille d'un fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Obtenir les dimensions d'une image
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Créer une miniature d'une image
 */
export async function createThumbnail(
  file: File,
  maxSize: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const width = Math.floor(img.width * ratio);
        const height = Math.floor(img.height * ratio);

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresser plusieurs images en parallèle
 */
export async function compressImages(
  files: File[],
  options: CompressImageOptions = {},
  onProgress?: (progress: number) => void
): Promise<CompressedImage[]> {
  let completed = 0;

  const compressionPromises = files.map(async (file) => {
    try {
      const result = await compressImage(file, options);
      completed++;
      if (onProgress) {
        onProgress(Math.round((completed / files.length) * 100));
      }
      return result;
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      completed++;
      if (onProgress) {
        onProgress(Math.round((completed / files.length) * 100));
      }
      // Retourner le fichier original en cas d'échec
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        dimensions: await getImageDimensions(file).catch(() => ({
          width: 0,
          height: 0,
        })),
      };
    }
  });

  return Promise.all(compressionPromises);
}
