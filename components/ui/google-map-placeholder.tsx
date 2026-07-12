export interface GoogleMapPlaceholderProps {
  title: string;
  query: string;
}

export function GoogleMapPlaceholder({ title, query }: GoogleMapPlaceholderProps): React.JSX.Element {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[420px] w-full border-0"
      />
    </div>
  );
}
