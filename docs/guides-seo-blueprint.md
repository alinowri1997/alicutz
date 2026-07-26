# Guides SEO Blueprint System

## Goal

This blueprint enforces a consistent, production-grade SEO workflow for every future guide article.

No guide should be published without a valid blueprint and checklist pass.

## Frontmatter Blueprint Contract

Use this structure inside each guide MDX file:

```yaml
seoBlueprint:
  primaryKeyword: "private barber istanbul"
  secondaryKeywords:
    - "hotel barber istanbul"
    - "premium mens grooming istanbul"
  semanticKeywords:
    - "private appointment"
    - "osmanbey bomonti"
  searchIntent: "informational"
  targetAudience:
    - "tourists"
    - "business-travelers"
  countryTarget:
    - "Turkey"
  languageTarget:
    - "en"
  category: "tourist-guides"
  series:
    title: "Tourist Guide Series"
    slug: "tourist-guide-series"
  difficulty: "medium"
  estimatedReadingTime: "6 min read"
  slug: "private-barber-etiquette-istanbul"
  metaTitle: "Private Barber Etiquette in Istanbul Hotels | Ali Cutz Guides"
  metaDescription: "A premium protocol for private barber appointments in Istanbul hotels and residences."
  canonicalUrl: "https://alicutz.com/en/guides/private-barber-etiquette-istanbul"
  internalLinkingSuggestions:
    - slug: "hotel-room-grooming-checklist"
      anchor: "hotel room grooming checklist"
      reason: "Strengthens topical continuity for travel users."
  ctaType: "whatsapp-consultation"
  faqIdeas:
    - "How early should I book a private barber in Istanbul?"
    - "Can private service be done in hotel suites?"
  jsonLdSupport:
    - "Article"
    - "BreadcrumbList"
    - "FAQPage"
```

## Controlled Taxonomies

### Search Intent

- informational
- commercial
- transactional
- navigational

### Target Audience

- tourists
- business-travelers
- locals
- students
- luxury-clients

### Categories

- tourist-guides
- modern-haircuts
- classic-haircuts
- hotel-services
- languages
- mens-grooming

### Difficulty

- easy
- medium
- hard

### CTA Type

- whatsapp-consultation
- book-via-whatsapp
- message-on-whatsapp

### JSON-LD Support

- Article
- FAQPage
- BreadcrumbList
- HowTo
- ItemList
- Service

## Editorial Checklist Gate

Every guide must pass:

- SEO complete
- Internal links complete
- FAQ complete
- Schema complete
- Reading time
- Series
- Category
- Meta tags
- Slug

If any check fails, the guide is not ready to publish.

## Implementation Location

System source of truth:

- `lib/guides-blueprint.ts`
- `lib/guides.ts`

The blueprint is parsed from frontmatter, normalized, auto-completed with safe defaults, and exposed in `guide.item.seoBlueprint`.

The publish checklist is exposed in `guide.item.editorialChecklist`.

## Scale Notes (500+ Articles)

- Blueprint parsing is schema-based and reusable.
- Guide index access is cached.
- No per-article duplicated logic.
- Internal linking suggestions are structured and serializable.
