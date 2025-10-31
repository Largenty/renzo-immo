/**
 * Port : Image Storage
 * Interface abstraite pour gérer le stockage des images
 */

export interface IImageStorage {
  /**
   * Uploader une image originale
   */
  uploadImage(projectId: string, file: File): Promise<string>

  /**
   * Supprimer une image
   */
  deleteImage(imageUrl: string): Promise<void>

  /**
   * Récupérer les métadonnées d'une image
   */
  getImageMetadata(imageUrl: string): Promise<{
    width?: number
    height?: number
    format?: string
    size?: number
  }>
}
