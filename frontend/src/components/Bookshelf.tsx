import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CampaignSummary } from '../types/campaign';

// Clickable hotspot regions for each of the 10 books on the filled bookshelf image.
// Positions are percentages of the 1536x1024 image, verified via pixel overlay.
const BOOK_SLOTS = [
  // Top shelf (L-R): slots 0-4
  { left: 7.68,  top: 20.02, width: 16.08, height: 27.64 },  // book 1: green/leaf
  { left: 23.76, top: 20.02, width: 14.97, height: 27.64 },  // book 2: red/sword
  { left: 38.74, top: 20.02, width: 17.90, height: 27.64 },  // book 3: blue/moon
  { left: 56.64, top: 20.02, width: 15.30, height: 27.64 },  // book 4: brown/skull
  { left: 71.94, top: 20.02, width: 17.90, height: 27.64 },  // book 5: teal/crystal
  // Bottom shelf (L-R): slots 5-9  — measured from brightness gap midpoints at y=680
  { left: 10.00, top: 52.25, width: 17.00, height: 28.61 },  // book 6: red/dragon
  { left: 27.00, top: 52.25, width: 17.00, height: 28.61 },  // book 7: green/potion
  { left: 44.00, top: 52.25, width: 16.80, height: 28.61 },  // book 8: blue/ship
  { left: 60.80, top: 52.25, width: 17.00, height: 28.61 },  // book 9: orange/eye
  { left: 77.80, top: 52.25, width: 15.00, height: 28.61 },  // book 10: brown/swords
];

const BOOKS_PER_SHELF = 10;

interface BookshelfProps {
  campaigns: CampaignSummary[];
}

export default function Bookshelf({ campaigns }: BookshelfProps) {
  const totalPages = Math.max(1, Math.ceil(campaigns.length / BOOKS_PER_SHELF));
  const [page, setPage] = useState(0);

  const pageCampaigns = campaigns.slice(
    page * BOOKS_PER_SHELF,
    (page + 1) * BOOKS_PER_SHELF,
  );

  // Map each campaign on this page to a slot index (0-9)
  const slotMap = new Map<number, CampaignSummary>();
  pageCampaigns.forEach((c, i) => slotMap.set(i, c));

  return (
    <div className="relative">
      {/* Shelf image container — image is a block element so the wrapper
          exactly matches its rendered size. Hotspots use percentage positioning
          relative to this wrapper, guaranteeing pixel-perfect alignment. */}
      <div className="relative w-full">
        <img
          src="/bookshelf-full.png"
          alt="Castle library bookshelf"
          className="block w-full h-auto select-none"
          draggable={false}
        />

        {/* Clickable hotspots + captions for campaigns */}
        {BOOK_SLOTS.map((slot, slotIndex) => {
          const campaign = slotMap.get(slotIndex);
          if (!campaign) return null;

          return (
            <Link
              key={campaign.slug}
              to={`/campaign/${campaign.slug}`}
              className="absolute group"
              style={{
                left: `${slot.left}%`,
                top: `${slot.top}%`,
                width: `${slot.width}%`,
                height: `${slot.height}%`,
              }}
            >
              {/* Hover highlight overlay */}
              <div className="absolute inset-0 rounded-sm transition-all duration-300
                opacity-0 group-hover:opacity-100
                shadow-[0_0_20px_6px_rgba(200,169,81,0.45)]
                bg-gold-accent/[0.07]" />

              {/* Campaign title caption below the book */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 w-max max-w-[160%] pointer-events-none">
                <span className="inline-block bg-castle-dark/85 text-gold-accent text-[0.65rem] md:text-xs
                  px-2 py-0.5 rounded border border-gold-accent/30 font-serif
                  shadow-[0_0_8px_rgba(200,169,81,0.15)]
                  group-hover:border-gold-accent/60
                  group-hover:shadow-[0_0_12px_rgba(200,169,81,0.35)]
                  transition-all duration-300 whitespace-nowrap truncate">
                  {campaign.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination arrows (only if more than 1 page) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className={`px-4 py-1.5 rounded-lg border text-sm font-serif transition-all
              ${page === 0
                ? 'text-castle-stone/40 border-castle-stone/20 cursor-default'
                : 'text-gold-accent border-gold-accent/40 hover:border-gold-accent hover:bg-gold-accent/10 cursor-pointer'
              }`}
            aria-label="Previous shelf"
          >
            &#9664; Prev Shelf
          </button>
          <span className="text-parchment-dark/60 text-sm font-serif">
            Shelf {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className={`px-4 py-1.5 rounded-lg border text-sm font-serif transition-all
              ${page === totalPages - 1
                ? 'text-castle-stone/40 border-castle-stone/20 cursor-default'
                : 'text-gold-accent border-gold-accent/40 hover:border-gold-accent hover:bg-gold-accent/10 cursor-pointer'
              }`}
            aria-label="Next shelf"
          >
            Next Shelf &#9654;
          </button>
        </div>
      )}
    </div>
  );
}
