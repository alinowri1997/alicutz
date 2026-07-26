import {AdminLoginClient} from "./page-client";

export const dynamic = "force-dynamic";

export default function AdminLoginPage(): React.JSX.Element {
  return (
    <>
      <span className="sr-only">admin-login-entry</span>
      <AdminLoginClient />
    </>
  );
}