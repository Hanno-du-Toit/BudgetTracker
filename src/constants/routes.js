export const ROUTES = {
  HOME:         '/',
  LOGIN:        '/login',
  SIGNUP:       '/signup',
  DASHBOARD:    '/dashboard',
  UPLOAD:       '/upload',
  TRANSACTIONS: '/transactions',
  CATEGORY:     '/category/:slug',
  SETTINGS:     '/settings',
}

export const categoryRoute = (slug) => `/category/${slug}`
