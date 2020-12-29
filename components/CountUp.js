import { useState, useEffect } from 'react'

const easeOutQuad = (t) => t * (2 - t)
const frameDuration = 1000 / 60

const CountUp = ({
  duration = 2000,
  triggerAnimOnScroll = false,
  referenceElId = '',
  children
}) => {
  const countTo = parseInt(children, 10)
  const [count, setCount] = useState(0)
  const [animTriggered, setAnimTriggered] = useState(false)

  useEffect(() => {
    let frame = 0
    const totalFrames = Math.round(duration / frameDuration)

    async function handleScroll() {
      const reference = document.getElementById(referenceElId)
      if (reference && !animTriggered) {
        const yOffset = reference.getBoundingClientRect().top - window.innerHeight + 20
        if (yOffset <= 0) {
          setAnimTriggered(true)
          setCount(0)
          const counter = setInterval(() => {
            frame++
            const progress = easeOutQuad(frame / totalFrames)
            setCount(countTo * progress)

            if (frame === totalFrames) clearInterval(counter)
          }, frameDuration)
        }
      }
    }

    if (triggerAnimOnScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true })
    } else {
      const counter = setInterval(() => {
        frame++
        const progress = easeOutQuad(frame / totalFrames)
        setCount(countTo * progress)

        if (frame === totalFrames) clearInterval(counter)
      }, frameDuration)
    }

    return () => {
      if (triggerAnimOnScroll) window.removeEventListener('scroll', handleScroll)
    }
  }, [animTriggered])

  return <span>{Math.floor(count)}</span>
}

export default CountUp
