"use client";

import * as React from "react";
import {
  Globe,
  Image,
  LayoutDashboard,
  MessageSquare,
  Phone,
  Search,
  Settings,
  Sparkles,
  Wrench,
  Images,
} from "lucide-react";

import {
  PageHeader,
  Sidebar,
  Topbar,
  type SidebarItem,
} from "@/components/admin";
import {
  ContactManager,
  DashboardHome,
  FeaturedCutsManager,
  HeroManager,
  LoginScreen,
  MediaLibraryManager,
  PlaceholderModule,
  ReviewsManager,
  ServicesManager,
  SettingsManager,
} from "@/components/admin/modules";
import {useAdminSession} from "@/hooks/use-admin-session";

const NAV_ITEMS: SidebarItem[] = [
  {key: "dashboard", label: "Dashboard", icon: LayoutDashboard},
  {key: "hero", label: "Hero", icon: Sparkles},
  {key: "featured-cuts", label: "Featured Cuts", icon: Image},
  {key: "services", label: "Services", icon: Wrench},
  {key: "reviews", label: "Reviews", icon: MessageSquare},
  {key: "contact", label: "Contact", icon: Phone},
  {key: "languages", label: "Languages", icon: Globe},
  {key: "seo", label: "SEO", icon: Search},
  {key: "settings", label: "Settings", icon: Settings},
  {key: "media-library", label: "Media Library", icon: Images},
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
      return <PlaceholderModule title="Languages" />;
    case "seo":
      return <PlaceholderModule title="SEO" />;
    default:
      return <DashboardHome />;
  }
}

export default function AdminPage(): React.JSX.Element {
  const {isAuthenticated, isLoading, signIn, signOut} = useAdminSession();
  const [activePage, setActivePage] = React.useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const currentPage = formatPageLabel(activePage);

  if (!isAuthenticated) {
    return <LoginScreen onSubmit={signIn} isLoading={isLoading} />;
  }

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
