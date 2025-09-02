import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 허용 경로: RHA 메인, RHA 단계 페이지
  const isAllowed =
    /^\/ch3\/m1$/.test(pathname) ||
    /^\/ch3\/m1\/step(\/.*)?$/.test(pathname);

  if (!isAllowed) {
    const url = req.nextUrl.clone();
    url.pathname = '/ch3/m1';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// 정적/내부 자원은 미들웨어 제외
export const config = {
  matcher: [
    '/((?!_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|avif)).*)',
  ],
};


