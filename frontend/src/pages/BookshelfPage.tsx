import { useEffect, useState } from 'react';
import Bookshelf from '../components/Bookshelf';
import { listCampaigns } from '../api/campaigns';
import type { CampaignSummary } from '../types/campaign';


export default function BookshelfPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCampaigns()
      .then(setCampaigns)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-castle-dark flex flex-col items-center justify-center p-4 md:p-8">
      {/* Castle window frame */}
      <div className="w-full max-w-5xl">
        {/* Stone arch header */}
        <div className="relative text-center pb-4">
          {/* Decorative top corners */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold-accent/40 to-transparent" />

          <h1 className="text-4xl md:text-5xl text-gold-accent font-serif mt-4 tracking-wider
            drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            D&D Storybook
          </h1>
          <p className="text-parchment-dark/60 text-sm font-serif mt-1 tracking-widest uppercase">
            The Grand Library
          </p>

          {/* Decorative divider — ornamental rule */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-gold-accent/50" />
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rotate-45 bg-gold-accent/60" />
              <span className="w-2 h-2 rotate-45 bg-gold-accent" />
              <span className="w-1.5 h-1.5 rotate-45 bg-gold-accent/60" />
            </div>
            <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-gold-accent/50" />
          </div>
        </div>

        {/* Castle window border around the bookshelf */}
        <div className="relative mt-2">
          {/* Stone border effect */}
          <div className="absolute -inset-2 md:-inset-3 rounded-lg
            border-2 border-castle-stone/30
            bg-gradient-to-b from-castle-stone/10 to-transparent
            pointer-events-none" />

          {/* Corner stones */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-castle-stone/40 rounded-sm
            border border-castle-stone/50 pointer-events-none" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-castle-stone/40 rounded-sm
            border border-castle-stone/50 pointer-events-none" />
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-castle-stone/40 rounded-sm
            border border-castle-stone/50 pointer-events-none" />
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-castle-stone/40 rounded-sm
            border border-castle-stone/50 pointer-events-none" />

          {/* Inner shadow/glow to look like peering through a window */}
          <div className="absolute inset-0 rounded
            shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]
            pointer-events-none z-10" />

          {loading && (
            <div className="flex items-center justify-center py-32">
              <p className="text-parchment-dark text-lg font-serif">Loading library...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-32">
              <p className="text-red-400 text-lg font-serif">Failed to load campaigns: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <Bookshelf campaigns={campaigns} />
          )}
        </div>

        {/* Bottom decorative line */}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gold-accent/30 to-transparent" />
        <p className="text-center text-castle-stone/40 text-xs font-serif mt-2 tracking-wide">
          Click a book to begin reading
        </p>
      </div>
    </div>
  );
}
