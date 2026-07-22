"use client";

import * as React from "react";
import {
  Globe,
  Image,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  SquarePen,
  Star,
  User,
  Wrench,
} from "lucide-react";

import {
  AdminCard,
  EmptyState,
  PageHeader,
  SectionContainer,
  Sidebar,
  StatsCard,
  Topbar,
  UploadCard,
  type SidebarItem,
} from "@/components/admin";

const NAV_ITEMS: SidebarItem[] = [
  {key: "dashboard", label: "Dashboard", icon: LayoutDashboard},
  {key: "hero", label: "Hero", icon: Sparkles},
  {key: "featured-cuts", label: "Featured Cuts", icon: Image},
  {key: "services", label: "Services", icon: Wrench},
  {key: "reviews", label: "Reviews", icon: MessageSquare},
  {key: "contact", label: "Contact", icon: User},
  {key: "languages", label: "Languages", icon: Globe},
  {key: "seo", label: "SEO", icon: Search},
  {key: "settings", label: "Settings", icon: Settings},
];

const DASHBOARD_STATS = [
  {label: "Hero Status", value: "Active", detail: "Last edited 2h ago"},
  {label: "Gallery Images", value: "48", detail: "12 featured cuts"},
  {label: "Reviews", value: "127", detail: "94% positive"},
  {label: "Services", value: "7", detail: "All published"},
  {label: "Storage", value: "1.8 GB", detail: "Hero + gallery assets"},
  {label: "Quick Actions", value: "6", detail: "Draft shortcuts ready"},
] as const;

function formatPageLabel(activeKey: string): string {
  const found = NAV_ITEMS.find((item) => item.key === activeKey);
  return found?.label ?? "Dashboard";
}

export default function AdminPage(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [activePage, setActivePage] = React.useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const currentPage = formatPageLabel(activePage);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setIsAuthenticated(true);
  };

  const handleLogout = (): void => {
    setIsAuthenticated(false);
    setActivePage("dashboard");
    setPassword("");
    setIsSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#080808] px-4 py-10 text-[#f2f2f2] md:py-16">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#101010] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.42)] md:p-8">
          <div className="space-y-2 border-b border-white/10 pb-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#868686]">Alicutz</p>
            <h1 className="text-2xl font-semibold text-[#f5f5f5]">Admin Login</h1>
            <p className="text-sm text-[#9f9f9f]">Secure access for internal management only.</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-xs font-medium uppercase tracking-[0.14em] text-[#8d8d8d]">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-11 w-full rounded-xl border border-white/15 bg-[#151515] px-3 text-sm text-[#f1f1f1] outline-none transition-colors focus:border-white/35"
                placeholder="admin@alicutz.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="admin-password"
                className="text-xs font-medium uppercase tracking-[0.14em] text-[#8d8d8d]"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-11 w-full rounded-xl border border-white/15 bg-[#151515] px-3 text-sm text-[#f1f1f1] outline-none transition-colors focus:border-white/35"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-xl border border-white/20 bg-[#1a1a1a] text-sm font-medium text-[#f5f5f5] transition-colors hover:bg-[#202020]"
            >
              Login
            </button>
          </form>

          <button type="button" className="mt-4 text-sm text-[#909090] underline-offset-4 hover:underline">
            Forgot password
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar
        items={NAV_ITEMS}
        activeKey={activePage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelect={(key) => setActivePage(key)}
        onLogout={handleLogout}
      />

      <div className="md:pl-72">
        <Topbar currentPage={currentPage} onMenuOpen={() => setIsSidebarOpen(true)} />

        <main className="space-y-6 px-4 py-6 md:px-8 md:py-8">
          <PageHeader title={currentPage} section={currentPage} />

          {activePage === "dashboard" ? (
            <>
              <SectionContainer
                title="Dashboard"
                description="Status overview for Hero, Featured Cuts, Reviews, Services, and storage usage."
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {DASHBOARD_STATS.map((stat) => (
                    <StatsCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
                  ))}
                </div>
              </SectionContainer>

              <SectionContainer title="Quick Actions" description="UI placeholders for future CMS actions.">
                <div className="grid gap-4 lg:grid-cols-3">
                  <UploadCard
                    title="Hero Media"
                    description="Prepare hero video upload flow"
                    buttonLabel="Upload Hero Video"
                  />
                  <UploadCard
                    title="Featured Gallery"
                    description="Prepare gallery upload flow"
                    buttonLabel="Upload Gallery Image"
                  />
                  <AdminCard title="Editorial Actions" subtitle="Fast admin shortcuts">
                    <div className="grid gap-2">
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-between rounded-xl border border-white/15 bg-[#161616] px-3 text-xs text-[#ececec]"
                      >
                        <span>Create service draft</span>
                        <SquarePen className="h-4 w-4 text-[#929292]" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-between rounded-xl border border-white/15 bg-[#161616] px-3 text-xs text-[#ececec]"
                      >
                        <span>Pin a featured cut</span>
                        <Star className="h-4 w-4 text-[#929292]" aria-hidden="true" />
                      </button>
                    </div>
                  </AdminCard>
                </div>
              </SectionContainer>

              <SectionContainer title="Activity" description="Upcoming dashboard modules will appear here.">
                <EmptyState
                  title="No activity widgets connected"
                  message="This dashboard is UI-only for now. Data integrations will be added in the next milestone."
                />
              </SectionContainer>
            </>
          ) : (
            <SectionContainer title={currentPage} description="UI placeholder for upcoming admin module.">
              <EmptyState
                title={`${currentPage} module is ready for integration`}
                message="Visual structure is prepared. CMS functionality will be connected in the next milestone."
              />
            </SectionContainer>
          )}
        </main>
      </div>
    </div>
  );
}
