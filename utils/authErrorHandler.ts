import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function authErrorHandler(error: any, request: NextRequest) {
  if (error.status === 429) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429 }
    );
  }

  if (error.status === 400) {
    return NextResponse.json(
      { error: 'Invalid request, please check your credentials' },
      { status: 400 }
    );
  }

  if (error.status === 401) {
    return NextResponse.json(
      { error: 'Unauthorized, please login again' },
      { status: 401 }
    );
  }

  // Default error response
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

export function isAuthError(error: any): boolean {
  return [400, 401, 429].includes(error?.status);
}