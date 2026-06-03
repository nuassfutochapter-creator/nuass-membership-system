import { redirect } from 'next/navigation'
import { getMemberSession } from '@/lib/auth'
import PortalSidebar from '@/components/layout/PortalSidebar'
import PortalHeader from '@/components/layout/PortalHeader'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getMemberSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PortalSidebar session={session} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <PortalHeader session={session} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
