import { useEffect, useState } from "react"

function useStageAnimation() {

  const [enteringStage, setEnteringStage] = useState(false)

  function startStageEnter() {
    setEnteringStage(true)
  }

  useEffect(() => {

    if (!enteringStage) return

    const t = setTimeout(() => {
      setEnteringStage(false)
    }, 1300)

    return () => clearTimeout(t)

  }, [enteringStage])

  return {
    enteringStage,
    startStageEnter,
  }
}

export default useStageAnimation