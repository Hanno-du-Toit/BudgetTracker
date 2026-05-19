export const ROUTES = {
  HOME:             '/',
  LOGIN:            '/login',
  SIGNUP:           '/signup',
  FORGOT_PASSWORD:  '/forgot-password',
  RESET_PASSWORD:   '/reset-password',
  DASHBOARD:        '/dashboard',
  UPLOAD:           '/upload',
  TRANSACTIONS:     '/transactions',
  CATEGORY:         '/category/:slug',
  SETTINGS:         '/settings',
}

export const categoryRoute = (slug) => `/category/${slug}`
