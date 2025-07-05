declare module 'next/server' {
  export interface NextRequest extends Request {
    ip?: string;
    nextUrl: URL;
  }

  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static next(): NextResponse;
  }
}

declare module 'next' {
  export interface NextConfig {
    [key: string]: any;
  }
} 