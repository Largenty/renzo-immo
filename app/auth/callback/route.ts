/**
 * Auth Callback Route
 * Gère le callback OAuth (Google) et la vérification d'email
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { isValidRedirectPath, requireEmail } from "@/lib/api/helpers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") || "/dashboard";
  const origin = requestUrl.origin;

  // ✅ SECURITY: Valider le chemin de redirection pour éviter les Open Redirects
  const next = isValidRedirectPath(rawNext) ? rawNext : "/dashboard";

  if (rawNext !== next) {
    logger.warn("[Auth Callback] Invalid redirect path blocked", {
      attempted: rawNext,
      fallback: next,
    });
  }

  if (code) {
    const supabase = await createClient();

    // Échanger le code contre une session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      logger.error("[Auth Callback] Auth error or no user", { error });
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
    }

    // ✅ VALIDATION: Vérifier que l'email est présent
    let validatedEmail: string;
    try {
      validatedEmail = requireEmail(data.user.email);
    } catch (emailError) {
      logger.error("[Auth Callback] User email missing or invalid", {
        userId: data.user.id,
        error: emailError,
      });
      return NextResponse.redirect(`${origin}/auth/login?error=no_email`);
    }

    // Créer le client admin une seule fois
    const adminClient = createAdminClient();

    // Vérifier si l'utilisateur existe dans notre table users (utiliser adminClient)
    const { data: existingUser, error: userCheckError } = await adminClient
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .single();

    // Vérifier si l'erreur est due à l'absence de l'utilisateur (PGRST116) ou une vraie erreur
    if (userCheckError && userCheckError.code !== "PGRST116") {
      logger.error("Error checking existing user:", userCheckError);
      return NextResponse.redirect(
        `${origin}/auth/login?error=user_check_failed`
      );
    }

    const now = new Date().toISOString();

    // Si c'est un nouveau user (OAuth Google ou première connexion après signup), créer l'entrée
    if (!existingUser) {
      const names = (data.user.user_metadata?.full_name || "").split(" ");
      const firstName =
        names[0] ||
        data.user.user_metadata?.given_name ||
        data.user.user_metadata?.first_name ||
        "User";
      const lastName =
        names.slice(1).join(" ") ||
        data.user.user_metadata?.family_name ||
        data.user.user_metadata?.last_name ||
        "";

      const isOAuthProvider = data.user.app_metadata?.provider === "google";

      // ✅ CREDITS: Attribuer des crédits de bienvenue pour les nouveaux utilisateurs
      const WELCOME_CREDITS = 5;

      const { error: insertError } = await adminClient.from("users").insert({
        id: data.user.id,
        email: validatedEmail,
        first_name: firstName,
        last_name: lastName,
        avatar_url:
          data.user.user_metadata?.avatar_url ||
          data.user.user_metadata?.picture,
        email_verified: data.user.email_confirmed_at ? true : false,
        // ✅ FIX: Ne pas mettre de valeur arbitraire dans password_hash
        // Si la colonne est NOT NULL, il faudrait la rendre nullable
        // Pour l'instant, on met une valeur distincte pour OAuth vs email/password
        password_hash: isOAuthProvider ? null : "managed_by_supabase_auth",
        auth_provider: data.user.app_metadata?.provider || "email",
        credits_remaining: WELCOME_CREDITS, // Crédits de bienvenue
        last_login_at: now,
      });

      if (insertError) {
        // ✅ CONFLICT: Gestion du conflit email (email déjà existant)
        if (insertError.code === '23505') {
          logger.warn("[Auth Callback] User already exists with this email", {
            email: validatedEmail,
            provider: data.user.app_metadata?.provider,
            attemptedAuthId: data.user.id,
          });

          return NextResponse.redirect(
            `${origin}/auth/login?error=email_already_exists&provider=${data.user.app_metadata?.provider || 'unknown'}`
          );
        }

        logger.error("Error creating user in database:", insertError);
        return NextResponse.redirect(
          `${origin}/auth/login?error=user_creation_failed`
        );
      }

      // ✅ LOG: Nouveau utilisateur créé avec crédits
      logger.info("[Auth Callback] New user created", {
        userId: data.user.id,
        email: validatedEmail,
        provider: data.user.app_metadata?.provider,
        welcomeCredits: WELCOME_CREDITS,
      });
    } else {
      // Si l'utilisateur existe, mettre à jour email_verified et last_login_at
      const { error: updateError } = await adminClient
        .from("users")
        .update({
          email_verified: data.user.email_confirmed_at ? true : false,
          last_login_at: now,
        })
        .eq("id", data.user.id);

      if (updateError) {
        logger.error("Error updating user in database:", updateError);
        // Ne pas bloquer la connexion si la mise à jour échoue
        logger.warn("User login will proceed despite update error");
      }
    }

    // ✅ SUCCESS: Logger la connexion réussie
    logger.info("[Auth Callback] User authenticated successfully", {
      userId: data.user.id,
      email: validatedEmail,
      provider: data.user.app_metadata?.provider,
      isNewUser: !existingUser,
      redirectTo: next,
    });

    // Rediriger vers la page demandée ou le dashboard par défaut
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Erreur : pas de code
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
}
