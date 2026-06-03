import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar session={session} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminHeader session={session} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
