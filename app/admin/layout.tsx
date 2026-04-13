import { requireAdmin } from '@/lib/admin-auth'
import AdminSidebar from './AdminSidebar'

export const metadata = { title: { template: '%s | 管理画面', default: '管理画面' } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
