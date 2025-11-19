/**
 * Frontend Auth Utilities
 * Handles authentication with Cloudflare Workers API
 */

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

/**
 * Login with Google OAuth
 * Redirects to Google OAuth flow
 */
export async function loginWithGoogle(): Promise<void> {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  window.location.href = `${apiUrl}/api/auth/login/google`;
}

/**
 * Logout user
 * Clears session cookie
 */
export async function logout(): Promise<void> {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  try {
    const response = await fetch(`${apiUrl}/api/auth/logout`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Clear any local state
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect even if API call fails
    window.location.href = '/';
  }
}

/**
 * Get current user
 * Returns user data if authenticated, null otherwise
 */
export async function getUser(): Promise<User | null> {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  try {
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    const user = await response.json<User>();
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Check if user is logged in
 * Returns true if authenticated, false otherwise
 */
export async function isLoggedIn(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}

/**
 * Get user ID from current session
 * Returns user ID if authenticated, null otherwise
 */
export async function getUserId(): Promise<string | null> {
  const user = await getUser();
  return user?.id || null;
}
