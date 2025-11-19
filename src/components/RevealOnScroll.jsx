import { useEffect, useRef, useState } from 'react'

function RevealOnScroll({ children, delayMs = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const baseDelay = 80
            setTimeout(() => setVisible(true), baseDelay + delayMs)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [delayMs])

  return (
    <div
      ref={ref}
      className={`will-change-transform will-change-opacity transition-opacity transition-transform duration-700 ease-out motion-safe:transform ${
        visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-95'
      }`}
    >
      {children}
    </div>
  )
}

export default RevealOnScroll


