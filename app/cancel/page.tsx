import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Cancel from '../../components/Cancel'

export default async function CancelPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  return (
    <div className="font-sans min-h-screen">
      <Cancel />
    </div>
  )
}

