function ProviderPill({ provider }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-paper/85">
      {provider.logo ? (
        <img src={provider.logo} alt="" className="h-5 w-5 rounded-full object-cover" />
      ) : null}
      {provider.name}
    </span>
  );
}

export default function PlatformGroup({ title, regionCode, providers }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-ink/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-paper/55">
          {title}
        </span>
        <span className="glass-pill">{regionCode}</span>
      </div>

      {providers?.streaming?.length ? (
        <div className="flex flex-wrap gap-2">
          {providers.streaming.map((provider) => (
            <ProviderPill key={`${regionCode}-${provider.id}`} provider={provider} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-paper/60">No subscription streaming providers listed.</p>
      )}
    </div>
  );
}

