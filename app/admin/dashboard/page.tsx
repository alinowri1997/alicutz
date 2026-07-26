import {AdminDashboardClient} from "./page-client";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage(): React.JSX.Element {
  return (
    <>
      <span className="sr-only">admin-dashboard-entry</span>
      <AdminDashboardClient />
    </>
  );
}