/**
 * Utilitaires pour l'export d'images
 * Téléchargement ZIP, watermark, etc.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Interface pour une image à exporter
 */
export interface ExportImage {
  url: string;
  filename: string;
}

/**
 * Options d'export
 */
export interface ExportOptions {
  projectName?: string;
  includeOriginals?: boolean;
  addWatermark?: boolean;
  watermarkText?: string;
}

/**
 * Télécharger une seule image
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Failed to download image');
  }
}

/**
 * Télécharger plusieurs images en ZIP
 *
 * @param images - Liste des images à télécharger
 * @param options - Options d'export
 * @param onProgress - Callback de progression (0-100)
 *
 * @example
 * ```tsx
 * await downloadImagesAsZip(
 *   [
 *     { url: '/image1.jpg', filename: 'image1.jpg' },
 *     { url: '/image2.jpg', filename: 'image2.jpg' },
 *   ],
 *   { projectName: 'Mon Projet', includeOriginals: true },
 *   (progress) => console.log(`${progress}%`)
 * );
 * ```
 */
export async function downloadImagesAsZip(
  images: ExportImage[],
  options: ExportOptions = {},
  onProgress?: (progress: number) => void
): Promise<void> {
  const {
    projectName = 'export',
    includeOriginals = false,
    addWatermark = false,
    watermarkText = '',
  } = options;

  const zip = new JSZip();
  let completed = 0;

  // Créer des dossiers
  const transformedFolder = zip.folder('transformed');
  const originalsFolder = includeOriginals ? zip.folder('originals') : null;

  // Télécharger et ajouter chaque image au ZIP
  for (const image of images) {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();

      // Ajouter au dossier approprié
      if (image.filename.includes('original') && originalsFolder) {
        originalsFolder.file(image.filename, blob);
      } else if (transformedFolder) {
        transformedFolder.file(image.filename, blob);
      }

      completed++;
      if (onProgress) {
        onProgress(Math.round((completed / images.length) * 100));
      }
    } catch (error) {
      console.error(`Failed to download ${image.filename}:`, error);
      // Continue avec les autres images
    }
  }

  // Ajouter un fichier README
  const readmeContent = `
# ${projectName}

Export créé le ${new Date().toLocaleDateString('fr-FR')}

## Contenu

- ${images.length} image${images.length > 1 ? 's' : ''} transformée${images.length > 1 ? 's' : ''}
${includeOriginals ? '- Images originales incluses' : ''}

---
Généré avec Renzo Immobilier
`.trim();

  zip.file('README.txt', readmeContent);

  // Générer le ZIP et télécharger
  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const filename = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.zip`;
    saveAs(zipBlob, filename);
  } catch (error) {
    console.error('Error generating ZIP:', error);
    throw new Error('Failed to generate ZIP file');
  }
}

/**
 * Créer un canvas avec watermark
 */
export async function addWatermarkToImage(
  imageUrl: string,
  watermarkText: string,
  options: {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
    fontSize?: number;
    opacity?: number;
  } = {}
): Promise<Blob> {
  const {
    position = 'bottom-right',
    fontSize = 24,
    opacity = 0.5,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Dessiner l'image
      ctx.drawImage(img, 0, 0);

      // Configurer le watermark
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
      ctx.lineWidth = 2;

      // Calculer la position
      const textMetrics = ctx.measureText(watermarkText);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;
      const padding = 20;

      let x = 0;
      let y = 0;

      switch (position) {
        case 'bottom-right':
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
          break;
        case 'bottom-left':
          x = padding;
          y = canvas.height - padding;
          break;
        case 'top-right':
          x = canvas.width - textWidth - padding;
          y = textHeight + padding;
          break;
        case 'top-left':
          x = padding;
          y = textHeight + padding;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = canvas.height / 2;
          break;
      }

      // Dessiner le watermark
      ctx.strokeText(watermarkText, x, y);
      ctx.fillText(watermarkText, x, y);

      // Convertir en blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.95);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

/**
 * Formater un nom de fichier sûr
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
