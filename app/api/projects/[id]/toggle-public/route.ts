import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/projects/[id]/toggle-public
 * Toggle project's public visibility
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: projectId } = params;
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { isPublic } = body;

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'Le champ isPublic doit être un booléen' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier ce projet' },
        { status: 403 }
      );
    }

    // Update is_public field
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select('id, is_public')
      .single();

    if (updateError) {
      console.error('Error updating project:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du projet' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isPublic: updatedProject.is_public,
    });
  } catch (error) {
    console.error('Toggle public API error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
