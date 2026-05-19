export const DURATION = {
  fast:   0.15,
  normal: 0.25,
  slow:   0.4,
}

export const EASING = {
  out:    [0.0, 0.0, 0.2, 1],
  inOut:  [0.4, 0.0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
}

// Enter: slide up + fade. Exit: fade only (no movement prevents jarring on scroll).
export const PAGE_TRANSITION = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: DURATION.normal, ease: EASING.out },
}

export const FADE_IN = {
  initial:   { opacity: 0 },
  animate:   { opacity: 1 },
  exit:      { opacity: 0 },
  transition: { duration: DURATION.fast },
}

export const SLIDE_UP = {
  initial:   { opacity: 0, y: 16 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0, y: 8 },
  transition: { duration: DURATION.normal, ease: EASING.out },
}

export const SLIDE_IN_RIGHT = {
  initial:   { opacity: 0, x: '100%' },
  animate:   { opacity: 1, x: 0 },
  exit:      { opacity: 0, x: '100%' },
  transition: { duration: DURATION.normal, ease: EASING.out },
}

export const LIST_ITEM = {
  initial:   { opacity: 0, x: -8 },
  animate:   { opacity: 1, x: 0 },
  exit:      { opacity: 0, x: 8 },
  transition: { duration: DURATION.fast },
}

export const STAGGER_CONTAINER = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
}
