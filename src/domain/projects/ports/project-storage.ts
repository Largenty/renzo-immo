/**
 * Port : Project Storage
 * Interface abstraite pour gérer le stockage des fichiers liés aux projets
 */

export interface IProjectStorage {
  /**
   * Uploader une image de couverture pour un projet
   */
  uploadCoverImage(file: File): Promise<string>

  /**
   * Supprimer une image de couverture
   */
  deleteCoverImage(imageUrl: string): Promise<void>

  /**
   * Uploader une image de projet
   */
  uploadProjectImage(projectId: string, file: File): Promise<string>

  /**
   * Supprimer toutes les images d'un projet
   */
  deleteProjectImages(projectId: string): Promise<void>
}
