import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  // Vérifie le cookie d'auth (JWT Supabase)
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  // Vérifie le rôle via Supabase
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  // Récupère les rôles de l'utilisateur
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', user.id);
  const roleNames = (roles || []).map((r: any) => r.roles?.name).filter(Boolean);
  if (!roleNames.includes('admin')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
