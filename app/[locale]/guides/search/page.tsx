import type {Metadata} from "next";
import {redirect} from "next/navigation";

interface GuidesSearchPageProps {
  params: Promise<{locale: string}>;
  searchParams: Promise<{q?: string}>;
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function GuidesSearchPage({params, searchParams}: GuidesSearchPageProps): Promise<never> {
  const {locale} = await params;
  const {q} = await searchParams;
  const query = q?.trim();

  if (!query) {
    redirect(`/${locale}/guides`);
  }

  redirect(`/${locale}/guides?q=${encodeURIComponent(query)}`);
}
