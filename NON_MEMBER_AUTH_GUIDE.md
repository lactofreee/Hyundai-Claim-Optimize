# 비회원 본인인증 및 세션 관리 아키텍처 가이드 (Next.js App Router)

본 문서는 Next.js (App Router) 환경에서 보험 미가입자(비회원)를 위한 **보안 강화 인증 시스템** 구현 가이드입니다. 외부 링크 재진입 시 강제 재인증 로직과 보안 세션 관리 전략을 포함합니다.

---

## 1. 아키텍처 개요 (Architecture Overview)

### 핵심 요구사항
1.  **무가입 인증**: 회원가입 없이 본인인증(CI/DI)만으로 서비스 이용.
2.  **엄격한 세션 통제**: 외부 링크(문자 메시지, 카카오톡 등)를 통해 재진입 시, 기존 세션이 살아있더라도 파기하고 **재인증**을 강제함.
3.  **보안**: 민감 정보(주민번호 등)는 클라이언트(LocalStorage)에 저장하지 않고, **HttpOnly Cookie** 기반의 세션으로 관리.

### 데이터 흐름 (Data Flow)
1.  **진입 (Entry)**: 사용자가 URL에 접근.
2.  **Middleware (Guard)**: `Referer` 헤더와 쿠키를 검사.
    *   **외부 유입**: `Referer`가 자사 도메인이 아니면 **세션 강제 파기(Logout)** 후 인증 페이지로 리다이렉트.
    *   **내부 이동**: 유효한 세션 쿠키가 없으면 인증 페이지로 리다이렉트 (Protected Routes).
3.  **인증 (Server Action)**: 본인인증 성공 시, 서버에서 암호화된 세션 쿠키 발급 (`HttpOnly`, `Secure`).
4.  **서비스 이용**: Server Component에서 쿠키 서명을 검증하여 유저 식별.

---

## 2. 구현 상세 (Implementation Details)

### A. 미들웨어: 외부 유입 감지 및 세션 가드 (`middleware.ts`)

Next.js의 Middleware는 모든 요청의 진입점에서 실행되므로, 외부 유입을 가장 효과적으로 차단할 수 있는 계층입니다.

```typescript:middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const referer = request.headers.get('referer')
  const host = request.headers.get('host') // 예: my-insurance.com
  const hasSession = request.cookies.has('auth_session')

  // 1. 예외 경로 처리 (정적 리소스, 인증 페이지 등)
  if (pathname.startsWith('/_next') || pathname === '/auth' || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 2. 외부 링크 재진입 감지 로직
  // Referer가 존재하고, 우리 서비스의 Host를 포함하지 않는다면 외부 유입으로 간주
  const isExternalEntry = referer && host && !referer.includes(host)

  if (isExternalEntry && hasSession) {
    console.log('[Security] 외부 유입 감지: 세션을 파기하고 재인증을 요구합니다.')
    
    // 인증 페이지로 리다이렉트하며 세션 쿠키 삭제
    const response = NextResponse.redirect(new URL('/auth', request.url))
    response.cookies.delete('auth_session')
    return response
  }

  // 3. 비회원 세션 가드 (Protected Routes)
  // 세션이 없는 상태로 보호된 페이지 접근 시 인증 페이지로 이동
  if (!hasSession) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    // 모든 페이지 (api, _next 제외는 위 로직에서 처리하거나 여기서 정규식으로 제외 가능)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### B. 보안 세션 관리 (Server Actions)

`iron-session` 라이브러리를 사용하거나, Next.js 네이티브 `cookies()` API를 사용하여 암호화된 세션을 관리합니다. 민감한 정보(이름, 연락처, CI)는 반드시 서버에서만 해독 가능한 형태로 쿠키에 저장해야 합니다.

**설치 (권장)**: `npm install iron-session`

```typescript:lib/session.ts
// 세션 설정 및 타입 정의
import { SessionOptions } from "iron-session";

export interface UserSession {
  isLoggedIn: boolean;
  ci: string;    // 연계정보 (고유 식별자)
  name: string;
  phone: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string, // 32자 이상 비밀번호
  cookieName: "auth_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production", // HTTPS 전용
    httpOnly: true, // 자바스크립트 접근 불가 (XSS 방지)
    sameSite: "lax", // CSRF 방지
    maxAge: 60 * 30, // 30분 후 세션 만료 (금융/보험 서비스 권장 시간)
  },
};
```

```typescript:actions/auth.ts
'use server'

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, UserSession } from "@/lib/session";
import { redirect } from "next/navigation";

// 본인인증 성공 후 호출되는 서버 액션
export async function loginAction(authData: { name: string, phone: string, ci: string }) {
  const session = await getIronSession<UserSession>(cookies(), sessionOptions);

  // 세션 데이터 설정
  session.isLoggedIn = true;
  session.name = authData.name;
  session.phone = authData.phone;
  session.ci = authData.ci;

  await session.save(); // 암호화된 쿠키 설정 (Set-Cookie 헤더)
  
  redirect("/"); // 대시보드로 이동
}

// 로그아웃 액션
export async function logoutAction() {
  const session = await getIronSession<UserSession>(cookies(), sessionOptions);
  session.destroy();
  redirect("/auth");
}
```

### C. 비회원 정보 조회 패터 (Server Components)

Server Component에서는 별도의 API 호출 없이 쿠키를 바로 복호화하여 유저 정보를 사용할 수 있습니다.

```typescript:components/dashboard-profile.tsx
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, UserSession } from "@/lib/session";

export default async function DashboardProfile() {
  // 서버 사이드에서 세션 조회 (Zero API Latency)
  const session = await getIronSession<UserSession>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    return <div>인증 정보가 없습니다.</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{session.name}님 환영합니다.</h2>
      <p className="text-gray-500">인증된 연락처: {session.phone}</p>
    </div>
  );
}
```

---

## 3. 주니어 개발자를 위한 핵심 가이드 (Best Practices)

1.  **`LocalStorage` 금지 원칙**:
    *   본인인증 결과로 받은 `CI`, `전화번호` 등은 절대 `LocalStorage`나 `SessionStorage`에 저장하지 마세요. 이는 XSS 공격에 취약합니다. 항상 **HttpOnly Cookie**를 사용해야 합니다.

2.  **세션 탈취 방지 (Session Fixation)**:
    *   사용자가 외부 문자 링크 등을 통해 재진입할 때, 기존 세션을 재활용하면 보안 위험이 있습니다.
    *   위 `middleware.ts` 예시처럼 **외부 유입(`Referer` 불일치) 시 무조건 기존 세션을 파기(Destroy)**하고 새로 인증받도록 하는 것이 금융/보험 서비스의 표준 보안 패턴입니다.

3.  **브라우저 닫힘 = 세션 종료**:
    *   `maxAge` 설정과 별개로, 공용 PC 사용 등을 고려하여 **Session Cookie**(브라우저 닫으면 삭제됨) 방식을 고려할 수 있습니다.
    *   Next.js `iron-session` 옵션에서 `ttl`을 0으로 설정하면 브라우저 종료 시 쿠키가 삭제되는 Session Cookie로 동작합니다. 비즈니스 요건에 맞춰 선택하세요.

---

### 결론
Next.js의 **Middleware**와 **Server Actions**를 결합하면 복잡한 백엔드 API 서버 없이도 매우 강력한 보안 인증 시스템을 구축할 수 있습니다. 위 아키텍처는 "모든 진입점 제어(Middleware)"와 "안전한 데이터 저장(Server Action w/ Signed Cookie)"을 통해 비회원 데이터 주권을 보장합니다.
