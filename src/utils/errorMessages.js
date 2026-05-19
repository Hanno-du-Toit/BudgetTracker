const AUTH_ERROR_MAP = {
  'Invalid login credentials':                      'Your email or password is incorrect.',
  'Email not confirmed':                            'Please confirm your email address first — check your inbox.',
  'User already registered':                        'An account with this email already exists.',
  'Password should be at least 6 characters':       'Your password must be at least 6 characters long.',
  'Unable to validate email address: invalid format': 'Please enter a valid email address.',
  'Email rate limit exceeded':                      'Too many attempts. Please wait a few minutes and try again.',
  'over_email_send_rate_limit':                     'Too many emails sent. Please wait a few minutes.',
  'Token has expired or is invalid':                'This link has expired. Please request a new password reset.',
  'New password should be different from the old password': 'Your new password must be different from your current one.',
  'Auth session missing':                           'Your session has expired. Please sign in again.',
  'signup_disabled':                                'New sign-ups are currently disabled.',
  // Supabase / PostgREST DB errors (matched against error.message)
  'does not exist':              'A required database column is missing. Please run the latest SQL migration.',
  'violates row-level security': 'Permission denied. Check your Supabase RLS policies for this table.',
  'permission denied':           'Permission denied. Run the SQL migration to grant table access to the authenticated role.',
  'PGRST116':                    'Record not found. Please try saving again.',
  // Password reset specific
  'redirect_url not allowed':    'Invalid redirect URL. Add your site URL to Supabase → Authentication → URL Configuration → Redirect URLs.',
  'Redirect URL not allowed':    'Invalid redirect URL. Add your site URL to Supabase → Authentication → URL Configuration → Redirect URLs.',
  'redirect_url_mismatch':       'Redirect URL mismatch. Add your site URL to Supabase → Authentication → URL Configuration → Redirect URLs.',
  'For security purposes':       'Please wait 60 seconds before requesting another reset link.',
  'User not found':              'No account found with that email address.',
}

// PostgreSQL error codes that carry more reliable signal than message text.
const PG_CODE_MAP = {
  '42501': 'Permission denied. Run the SQL migration to grant table access to the authenticated role.',
  '42703': 'A required database column is missing. Please run the latest SQL migration.',
  '23505': 'A record with these details already exists.',
}

export function mapErrorToFriendly(error) {
  if (!error) return 'Something went wrong. Please try again.'

  const message = error?.message ?? String(error)
  const code    = String(error?.code ?? '')

  // Check PostgreSQL / PostgREST code first — more reliable than substring matching.
  if (PG_CODE_MAP[code]) return PG_CODE_MAP[code]

  for (const [key, friendly] of Object.entries(AUTH_ERROR_MAP)) {
    if (message.includes(key)) return friendly
  }

  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
    return 'Connection error. Please check your internet and try again.'
  }

  return 'Something went wrong. Please try again.'
}
