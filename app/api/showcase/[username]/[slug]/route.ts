import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    username: string;
    slug: string;
  };
}

/**
 * GET /api/showcase/[username]/[slug]
 * Fetch public project data for showcase page
 * No authentication required - public endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { username, slug } = params;

    // Decode URL parameters
    const decodedUsername = decodeURIComponent(username);
    const decodedSlug = decodeURIComponent(slug);

    // Create Supabase client (no auth required for public data)
    const supabase = await createClient();

    // Fetch user by display_name (case-insensitive exact match to prevent SQL injection)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, display_name, first_name, last_name, company, avatar_url')
      .ilike('display_name', decodedUsername.replace(/[%_]/g, '\\$&'))
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Fetch public project by slug
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, slug, cover_image_url, total_images, completed_images, view_count, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('slug', decodedSlug)
      .eq('is_public', true)
      .eq('status', 'active')
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Projet introuvable ou non public' },
        { status: 404 }
      );
    }

    // Fetch completed images with transformations
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select(`
        id,
        original_url,
        transformed_url,
        status,
        room_type,
        custom_room,
        created_at,
        transformation_types (
          id,
          name,
          description,
          icon_name
        )
      `)
      .eq('project_id', project.id)
      .eq('status', 'completed')
      .not('transformed_url', 'is', null)
      .order('created_at', { ascending: true });

    if (imagesError) {
      console.error('Error fetching images:', imagesError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des images' },
        { status: 500 }
      );
    }

    // 🔧 FIX: Increment view count atomically and get the actual new count
    const { data: newViewCount, error: updateError } = await supabase.rpc('increment_view_count', {
      project_id: project.id
    });

    // Use the actual count from database, or fall back to old count + 1 if RPC failed
    const actualViewCount = updateError ? (project.view_count || 0) + 1 : (newViewCount || (project.view_count || 0) + 1);

    if (updateError) {
      // Log error but don't fail the request - viewing is more important than counting
      console.warn('Failed to increment view count:', updateError);
    }

    // Return public showcase data
    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        coverImage: project.cover_image_url,
        totalImages: project.total_images,
        completedImages: project.completed_images,
        viewCount: actualViewCount, // 🔧 FIX: Use actual count from database
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
      owner: {
        displayName: user.display_name,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        avatarUrl: user.avatar_url,
      },
      images: images?.map((img) => {
        const transformationType = Array.isArray(img.transformation_types)
          ? img.transformation_types[0]
          : img.transformation_types;

        return {
          id: img.id,
          originalUrl: img.original_url,
          transformedUrl: img.transformed_url,
          roomType: img.room_type,
          customRoom: img.custom_room,
          transformationType: transformationType ? {
            name: transformationType.name,
            description: transformationType.description,
            iconName: transformationType.icon_name,
          } : null,
          createdAt: img.created_at,
        };
      }) || [],
    });
  } catch (error) {
    console.error('Showcase API error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
