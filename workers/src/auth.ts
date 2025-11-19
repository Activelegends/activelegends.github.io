/**
 * Cloudflare Workers Auth API
 * Handles Google OAuth flow with JWT sessions
 */

interface Env {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  DB: D1Database;
}

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  created_at: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

/**
 * JWT Utilities using WebCrypto
 */
class JWT {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  /**
   * Convert secret to CryptoKey for signing
   */
  private async getKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.secret);
    
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }

  /**
   * Base64 URL encode
   */
  private base64UrlEncode(data: Uint8Array): string {
    return btoa(String.fromCharCode(...data))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64 URL decode
   */
  private base64UrlDecode(str: string): Uint8Array {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padding);
    const binary = atob(padded);
    return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
  }

  /**
   * Sign and create JWT token
   */
  async sign(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 86400; // 1 day

    const header = { alg: 'HS256', typ: 'JWT' };
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp,
    };

    const encoder = new TextEncoder();
    const headerB64 = this.base64UrlEncode(encoder.encode(JSON.stringify(header)));
    const payloadB64 = this.base64UrlEncode(encoder.encode(JSON.stringify(fullPayload)));

    const signatureInput = `${headerB64}.${payloadB64}`;
    const key = await this.getKey();
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signatureInput)
    );

    const signatureB64 = this.base64UrlEncode(new Uint8Array(signature));
    return `${signatureInput}.${signatureB64}`;
  }

  /**
   * Verify and decode JWT token
   */
  async verify(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerB64, payloadB64, signatureB64] = parts;
      const signatureInput = `${headerB64}.${payloadB64}`;

      // Verify signature
      const key = await this.getKey();
      const encoder = new TextEncoder();
      const signature = this.base64UrlDecode(signatureB64);
      
      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        signature,
        encoder.encode(signatureInput)
      );

      if (!isValid) return null;

      // Decode payload
      const payloadJson = new TextDecoder().decode(this.base64UrlDecode(payloadB64));
      const payload: JWTPayload = JSON.parse(payloadJson);

      // Check expiration
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }
}

/**
 * Get JWT from cookie
 */
function getJWTFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  
  if (!sessionCookie) return null;
  return sessionCookie.split('=')[1];
}

/**
 * Set JWT cookie
 */
function setJWTCookie(token: string): string {
  const maxAge = 86400; // 1 day
  return `session=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}; Path=/`;
}

/**
 * Clear JWT cookie
 */
function clearJWTCookie(): string {
  return 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/';
}

/**
 * GET /api/auth/login/google
 * Redirect to Google OAuth
 */
export async function handleLoginGoogle(env: Env, request: Request): Promise<Response> {
  const redirectUri = `${new URL(request.url).origin}/api/auth/callback/google`;
  const scope = 'openid email profile';
  const state = crypto.randomUUID();

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', scope);
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');

  // Store state in cookie for verification
  const response = Response.redirect(googleAuthUrl.toString(), 302);
  response.headers.set('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`);
  
  return response;
}

/**
 * GET /api/auth/callback/google
 * Handle OAuth callback
 */
export async function handleCallbackGoogle(env: Env, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return Response.redirect(`${new URL(request.url).origin}/?error=${encodeURIComponent(error)}`, 302);
  }

  if (!code || !state) {
    return Response.redirect(`${new URL(request.url).origin}/?error=missing_params`, 302);
  }

  // Verify state
  const cookieHeader = request.headers.get('Cookie');
  const cookies = cookieHeader?.split(';').map(c => c.trim()) || [];
  const stateCookie = cookies.find(c => c.startsWith('oauth_state='));
  const storedState = stateCookie?.split('=')[1];

  if (!storedState || storedState !== state) {
    return Response.redirect(`${new URL(request.url).origin}/?error=invalid_state`, 302);
  }

  try {
    // Exchange code for tokens
    const redirectUri = `${new URL(request.url).origin}/api/auth/callback/google`;
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json<{
      access_token: string;
      id_token: string;
    }>();

    // Verify and decode ID token
    const idTokenParts = tokens.id_token.split('.');
    if (idTokenParts.length !== 3) {
      throw new Error('Invalid ID token');
    }

    const payloadJson = JSON.parse(
      atob(idTokenParts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    const { sub: googleId, email, name, picture } = payloadJson;

    if (!email) {
      throw new Error('Email not found in token');
    }

    // Create or find user in database
    let user: User;
    const existingUser = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first<User>();

    if (existingUser) {
      // Update user info
      await env.DB.prepare(
        'UPDATE users SET name = ?, picture = ? WHERE email = ?'
      ).bind(name || '', picture || '', email).run();
      user = { ...existingUser, name: name || existingUser.name, picture: picture || existingUser.picture };
    } else {
      // Create new user
      const userId = crypto.randomUUID();
      await env.DB.prepare(
        'INSERT INTO users (id, email, name, picture, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(userId, email, name || '', picture || '', new Date().toISOString()).run();
      
      user = {
        id: userId,
        email,
        name: name || '',
        picture: picture || '',
        created_at: new Date().toISOString(),
      };
    }

    // Generate JWT session token
    const jwt = new JWT(env.JWT_SECRET);
    const sessionToken = await jwt.sign({
      userId: user.id,
      email: user.email,
    });

    // Redirect with session cookie
    const response = Response.redirect(`${new URL(request.url).origin}/`, 302);
    response.headers.set('Set-Cookie', setJWTCookie(sessionToken));
    response.headers.append('Set-Cookie', `oauth_state=; Max-Age=0; Path=/`); // Clear state cookie
    
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return Response.redirect(
      `${new URL(request.url).origin}/?error=oauth_failed`,
      302
    );
  }
}

/**
 * GET /api/auth/me
 * Get current user from JWT
 */
export async function handleMe(env: Env, request: Request): Promise<Response> {
  const token = getJWTFromCookie(request);
  
  if (!token) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const jwt = new JWT(env.JWT_SECRET);
  const payload = await jwt.verify(token);

  if (!payload) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Get user from database
  const user = await env.DB.prepare(
    'SELECT id, email, name, picture, created_at FROM users WHERE id = ?'
  ).bind(payload.userId).first<User>();

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
  });
}

/**
 * GET /api/auth/logout
 * Clear session cookie
 */
export async function handleLogout(env: Env, request: Request): Promise<Response> {
  const response = Response.json({ success: true });
  response.headers.set('Set-Cookie', clearJWTCookie());
  return response;
}

/**
 * Main handler for auth routes
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': url.origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response: Response;

      if (path === '/api/auth/login/google' && request.method === 'GET') {
        response = await handleLoginGoogle(env, request);
      } else if (path === '/api/auth/callback/google' && request.method === 'GET') {
        response = await handleCallbackGoogle(env, request);
      } else if (path === '/api/auth/me' && request.method === 'GET') {
        response = await handleMe(env, request);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      } else if (path === '/api/auth/logout' && request.method === 'GET') {
        response = await handleLogout(env, request);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      } else {
        response = Response.json({ error: 'Not found' }, { status: 404 });
      }

      return response;
    } catch (error) {
      console.error('Auth handler error:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
