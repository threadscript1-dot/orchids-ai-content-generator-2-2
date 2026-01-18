"use client"

import Lottie from "lottie-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const LOTTIE_URL = "https://lottie.host/3dada0ef-6a08-4024-a4a2-57cf49dd44a1/XFQhacnUPU.lottie"

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  const [animationData, setAnimationData] = useState<object | null>(null)

  useEffect(() => {
    fetch(LOTTIE_URL)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch(console.error)
  }, [])

  if (!animationData) {
    return null
  }

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("size-6", className)}
      {...props}
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}

export { Spinner }
