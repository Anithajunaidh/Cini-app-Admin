/** API base paths and transport-level configuration. */

/** Base path used by the Next.js rewrite proxy for all v1 API calls. */
export const API_BASE_PATH = '/api/v1';

/** Timeout in ms for every axios request. */
export const API_TIMEOUT_MS = 15_000;

/** localStorage / cookie key that holds the Better Auth bearer token. */
export const ACCESS_TOKEN_KEY = 'access_token';

/** Redirect path shown to unauthenticated users. */
export const SIGN_IN_PATH = '/sign-in';

/** Redirect path after a successful login. */
export const DASHBOARD_PATH = '/dashboard';

/** Better Auth sign-in endpoint (proxied by Next.js rewrite). */
export const AUTH_SIGN_IN_PATH = '/api/auth/sign-in/email';
