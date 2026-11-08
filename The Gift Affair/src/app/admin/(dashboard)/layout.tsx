import AdminShell from "@/components/admin/AdminShell";
import { requireEditor } from "@/lib/auth";

// Admin pages always read fresh data with the editor's session.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const editor = await requireEditor();
  return <AdminShell user={{ displayName: editor.displayName, role: editor.role }}>{children}</AdminShell>;
}
