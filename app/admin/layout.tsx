import { requireAdminPage } from '@/lib/auth/admin'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage()
  return <AdminShell>{children}</AdminShell>
}
