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
  // Supabase DB errors
  'does not exist':                                 'A required database column is missing. Please run the latest SQL migration.',
  'violates row-level security':                    'Permission denied. Check your Supabase RLS policies.',
  'PGRST116':                                       'Profile record not found. Please try saving again.',
}

export function mapErrorToFriendly(error) {
  if (!error) return 'Something went wrong. Please try again.'

  const message = error?.message ?? String(error)

  for (const [key, friendly] of Object.entries(AUTH_ERROR_MAP)) {
    if (message.includes(key)) return friendly
  }

  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
    return 'Connection error. Please check your internet and try again.'
  }

  return 'Something went wrong. Please try again.'
}
