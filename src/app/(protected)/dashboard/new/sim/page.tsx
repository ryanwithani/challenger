import { Suspense } from 'react'
import NewSimClient from './NewSimClient'

export default function NewSimPage() {
  return (
    <Suspense fallback={<div className="text-center py-12"><p className="text-gray-500 dark:text-warmGray-400">Loading...</p></div>}>
      <NewSimClient />
    </Suspense>
  )
}
