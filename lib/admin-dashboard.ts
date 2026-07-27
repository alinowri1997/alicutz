export const ADMIN_NAV_ITEMS = [
  {key: "dashboard", label: "Dashboard", href: "/admin/dashboard"},
  {key: "reviews", label: "Reviews", href: "/admin/reviews"},
  {key: "services", label: "Services", href: "/admin/services"},
  {key: "hours", label: "Hours", href: "/admin/hours"},
  {key: "gallery", label: "Gallery", href: "/admin/gallery"},
  {key: "settings", label: "Settings", href: "/admin/settings"},
] as const;

export type AdminNavKey = (typeof ADMIN_NAV_ITEMS)[number]["key"];

export interface AdminServiceRecord {
  id: string;
  name: string;
  duration: string;
  active: boolean;
}

export interface AdminWorkingDay {
  id: string;
  day: string;
  open: string;
  close: string;
  enabled: boolean;
  breakDuration: string;
}

export interface AdminGalleryAsset {
  id: string;
  title: string;
  alt: string;
  imageUrl: string;
  featured: boolean;
  uploadedAt: string;
}

export interface AdminBusinessSettings {
  whatsapp: string;
  instagram: string;
  googleMaps: string;
  phone: string;
  email: string;
  defaultLanguage: string;
}

export const DEFAULT_ADMIN_SERVICES: AdminServiceRecord[] = [
  {id: "haircut", name: "Haircut", duration: "45 min", active: true},
  {id: "fade", name: "Skin Fade", duration: "60 min", active: true},
  {id: "beard", name: "Beard Styling", duration: "30 min", active: true},
  {id: "color", name: "Hair Coloring", duration: "90 min", active: false},
];

export const DEFAULT_ADMIN_HOURS: AdminWorkingDay[] = [
  {id: "mon", day: "Monday", open: "09:00", close: "22:00", enabled: true, breakDuration: "15"},
  {id: "tue", day: "Tuesday", open: "09:00", close: "22:00", enabled: true, breakDuration: "15"},
  {id: "wed", day: "Wednesday", open: "09:00", close: "22:00", enabled: true, breakDuration: "15"},
  {id: "thu", day: "Thursday", open: "09:00", close: "22:00", enabled: true, breakDuration: "15"},
  {id: "fri", day: "Friday", open: "09:00", close: "22:00", enabled: true, breakDuration: "15"},
  {id: "sat", day: "Saturday", open: "09:00", close: "22:00", enabled: true, breakDuration: "20"},
  {id: "sun", day: "Sunday", open: "09:00", close: "22:00", enabled: true, breakDuration: "20"},
];

export const DEFAULT_ADMIN_GALLERY: AdminGalleryAsset[] = [
  {id: "gallery-1", title: "Skin Fade", alt: "Premium skin fade result", imageUrl: "/gallery/mens-skin-fade-istanbul-premium-barber.jpg", featured: true, uploadedAt: "2026-07-18"},
  {id: "gallery-2", title: "Beard Styling", alt: "Precision beard styling result", imageUrl: "/gallery/beard-styling-istanbul-barber-alicutz.jpg", featured: true, uploadedAt: "2026-07-17"},
  {id: "gallery-3", title: "Modern Haircut", alt: "Modern haircut result", imageUrl: "/gallery/modern-haircut-istanbul-bomonti-barber.jpg", featured: false, uploadedAt: "2026-07-14"},
  {id: "gallery-4", title: "Low Fade", alt: "Low fade haircut result", imageUrl: "/gallery/low-fade-haircut-sisli-istanbul.jpg", featured: false, uploadedAt: "2026-07-10"},
];

export const DEFAULT_ADMIN_SETTINGS: AdminBusinessSettings = {
  whatsapp: "+90 544 177 22 49",
  instagram: "https://instagram.com/alicutzzzz",
  googleMaps: "https://www.google.com/maps?q=Osmanbey+Bomonti+Istanbul",
  phone: "+90 544 177 22 49",
  email: "97alicutzzzz@gmail.com",
  defaultLanguage: "tr",
};

export function createAdminId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildDashboardMetrics(services: AdminServiceRecord[], hours: AdminWorkingDay[], gallery: AdminGalleryAsset[], settings: AdminBusinessSettings) {
  const activeServices = services.filter((item) => item.active).length;
  const enabledDays = hours.filter((item) => item.enabled).length;
  const featuredImages = gallery.filter((item) => item.featured).length;
  const completedSettings = [settings.whatsapp, settings.instagram, settings.googleMaps, settings.phone, settings.email, settings.defaultLanguage].filter(Boolean).length;

  return [
    {label: "Active Services", value: String(activeServices), detail: `${services.length} total services`},
    {label: "Open Days", value: String(enabledDays), detail: "Monday through Sunday"},
    {label: "Featured Images", value: String(featuredImages), detail: "Hero-ready gallery selection"},
    {label: "Settings Ready", value: String(completedSettings), detail: "Core contact links configured"},
  ] as const;
}
