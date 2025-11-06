import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-middleware';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const { id } = await params;
    
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return ApiErrors.UNAUTHORIZED();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, role, email')
      .eq('id', id)
      .single();

    if (error || !user) {
      return ApiErrors.NOT_FOUND('User');
    }

    return apiSuccess(user);
  }, request);
}
