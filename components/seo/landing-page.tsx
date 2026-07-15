import Link from "next/link";

interface LandingPageLink {
  href: string;
  label: string;
}

interface LandingPageProps {
  heading: string;
  summary: string;
  links: LandingPageLink[];
  schemas: Record<string, unknown>[];
}

export function LandingPage({heading, summary, links, schemas}: LandingPageProps): React.JSX.Element {
  return (
    <main id="main-content" className="container py-32" aria-labelledby="landing-heading">
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
        />
      ))}

      <header className="max-w-[72ch] space-y-4">
        <h1 id="landing-heading" className="type-h2 text-text">
          {heading}
        </h1>
        <p className="type-body text-muted">{summary}</p>
      </header>

      <section className="mt-10 space-y-4" aria-labelledby="landing-navigation-heading">
        <h2 id="landing-navigation-heading" className="type-h5 text-text">
          Related Pages
        </h2>
        <nav aria-label="Related internal links">
          <ul className="grid gap-3 sm:grid-cols-2">
            {links.map((linkItem) => (
              <li key={linkItem.href}>
                <Link
                  href={linkItem.href}
                  className="type-small inline-flex min-h-11 items-center text-accent transition-colors duration-[var(--duration-fast)] hover:text-text focus-visible:outline-none focus-visible:text-text"
                >
                  {linkItem.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </main>
  );
}
