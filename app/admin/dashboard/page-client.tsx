"use client";

import * as React from "react";
import {
  Globe,
  Image,
  Images,
  LayoutDashboard,
  MessageSquare,
  Phone,
  Search,
  Settings,
  Sparkles,
  Wrench,
} from "lucide-react";

import {
  PageHeader,
  Sidebar,
  Topbar,
  type SidebarItem,
} from "@/components/admin";
import {
  ActivityLogManager,
  ContactManager,
  DashboardHome,
  FeaturedCutsManager,
  HeroManager,
  LanguagesManager,
  MediaLibraryManager,
  ReviewsManager,
  SeoManager,
  ServicesManager,
  SiteHealthManager,
  SettingsManager,
} from "@/components/admin/modules";
import {useAdminSession} from "@/hooks/use-admin-session";
import {useRouter} from "next/navigation";

const NAV_ITEMS: SidebarItem[] = [
  {key: "dashboard", label: "Dashboard", icon: LayoutDashboard},
  {key: "hero", label: "Hero", icon: Sparkles},
  {key: "featured-cuts", label: "Featured Cuts", icon: Image},
  {key: "services", label: "Services", icon: Wrench},
  {key: "reviews", label: "Reviews", icon: MessageSquare},
  {key: "contact", label: "Contact", icon: Phone},
  {key: "media-library", label: "Media Library", icon: Images},
  {key: "seo", label: "SEO", icon: Search},
  {key: "languages", label: "Languages", icon: Globe},
  {key: "settings", label: "Settings", icon: Settings},
  {key: "activity-log", label: "Activity Log", icon: MessageSquare},
  {key: "site-health", label: "Site Health", icon: Sparkles},
];

function formatPageLabel(activeKey: string): string {
  const found = NAV_ITEMS.find((item) => item.key === activeKey);
  return found?.label ?? "Dashboard";
}

function renderModule(activePage: string): React.JSX.Element {
  switch (activePage) {
    case "dashboard":
      return <DashboardHome />;
    case "hero":
      return <HeroManager />;
    case "featured-cuts":
      return <FeaturedCutsManager />;
    case "services":
      return <ServicesManager />;
    case "reviews":
      return <ReviewsManager />;
    case "contact":
      return <ContactManager />;
    case "settings":
      return <SettingsManager />;
    case "media-library":
      return <MediaLibraryManager />;
    case "languages":
      return <LanguagesManager />;
    case "seo":
      return <SeoManager />;
    case "activity-log":
      return <ActivityLogManager />;
    case "site-health":
      return <SiteHealthManager />;
    default:
      return <DashboardHome />;
  }
}

export function AdminDashboardClient(): React.JSX.Element {
  const {isAuthenticated, isLoading, signOut} = useAdminSession();
  const router = useRouter();
  const [activePage, setActivePage] = React.useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-[#080808]" aria-hidden="true" />;
  }

  const currentPage = formatPageLabel(activePage);

  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar
        items={NAV_ITEMS}
        activeKey={activePage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelect={(key) => setActivePage(key)}
        onLogout={() => void signOut()}
      />

      <div className="md:pl-72">
        <Topbar currentPage={currentPage} onMenuOpen={() => setIsSidebarOpen(true)} />

        <main className="space-y-6 px-4 py-6 md:px-8 md:py-8">
          <PageHeader title={currentPage} section={currentPage} />
          {renderModule(activePage)}
        </main>
      </div>
    </div>
  );
}