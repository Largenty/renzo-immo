import { z } from "zod";
import { passwordSchema } from "./auth.schemas";

/**
 * Schema Profile Settings
 */
export const profileSettingsSchema = z.object({
  displayName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .or(z.literal(""))
    .optional(),

  company: z
    .string()
    .max(100, "Le nom de l'entreprise ne peut pas dépasser 100 caractères")
    .or(z.literal(""))
    .optional(),

  phone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, "Numéro de téléphone invalide")
    .or(z.literal(""))
    .optional(),

  avatar: z
    .any()
    .refine((file) => {
      // Skip validation if no file or not in browser context
      if (!file || typeof File === "undefined") return true;
      return file instanceof File;
    }, "Doit être un fichier valide")
    .refine((file) => {
      if (!file || typeof File === "undefined") return true;
      return file.size <= 2 * 1024 * 1024;
    }, "Avatar max 2MB")
    .refine((file) => {
      if (!file || typeof File === "undefined") return true;
      return ["image/jpeg", "image/png"].includes(file.type);
    }, "Le format de fichier doit être JPEG ou PNG")
    .optional()
    .nullable(),
});

export type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;

/**
 * Schema Change Password
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: passwordSchema,
    confirmNewPassword: z
      .string()
      .min(1, "Veuillez confirmer le nouveau mot de passe"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Le nouveau mot de passe doit être différent de l'actuel",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Schema Notification Settings
 * Note: Les valeurs par défaut doivent être appliquées lors du parsing
 * ou dans le composant de formulaire (ex: form.defaultValues)
 */
export const notificationSettingsSchema = z.object({
  emailOnImageComplete: z.boolean(),
  emailOnCreditLow: z.boolean(),
  emailMarketing: z.boolean(),
});

export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;
