import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Watches for location changes and scrolls to the element matching
 * `location.hash`. Applies a pixel offset so the sticky navbar
 * does not cover the target section heading.
 */
const NAVBAR_OFFSET = 100 // px – height of sticky navbar + breathing room

export default function ScrollToHash() {
  const { pathname, hash, key } = useLocation()
  const prevKey = useRef(key)

  useEffect(() => {
    // Only act when the location actually changes
    if (prevKey.current === key) return
    prevKey.current = key

    if (hash) {
      const id = hash.replace('#', '')
      // Use a short delay so the target page has time to mount when
      // navigating from a different route (e.g. "/" → "/fellowship#pathways")
      const timer = setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          const top =
            el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET
          window.scrollTo({ top, behavior: 'smooth' })
        }
      }, 80)
      return () => clearTimeout(timer)
    }

    // No hash → scroll to top (normal route change)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname, hash, key])

  return null
}
