import { Suspense } from "react"
import LoadingScreen from "../../components/loading/LoadingScreen"

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <LoadingScreen />
    </Suspense>
  )
}