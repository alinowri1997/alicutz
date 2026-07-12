export default function LocaleLoading(): React.JSX.Element {
  return (
    <main id="main-content" className="container py-28">
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-32 rounded bg-surface" />
        <div className="h-10 w-2/3 rounded bg-surface" />
        <div className="h-5 w-full max-w-[46ch] rounded bg-surface" />
      </div>
    </main>
  );
}
