import { useState, useEffect } from 'react'

const easeOutQuad = (t) => t * (2 - t)
const frameDuration = 1000 / 60

const CountUp = ({
  duration = 2000,
  children
}) => {
  const countTo = parseInt(children, 10)
  const [count, setCount] = useState(0)

  useEffect(() => {
    let frame = 0
    const totalFrames = Math.round(duration / frameDuration)

    const counter = setInterval(() => {
      frame++
      const progress = easeOutQuad(frame / totalFrames)
      setCount(countTo * progress)

      if (frame === totalFrames) clearInterval(counter)
    }, frameDuration)

    return () => {
      clearInterval(counter)
    }
  }, [])

  return <span>{Math.floor(count)}</span>
}

export default CountUp
