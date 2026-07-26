import {AdminShell} from "@/components/admin";

export default function AdminLayout({children}: {children: React.ReactNode}): React.JSX.Element {
  return <AdminShell>{children}</AdminShell>;
}
