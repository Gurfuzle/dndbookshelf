import { useCallback } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface BookReaderProps {
  content: string;
  title: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export default function BookReader({
  content,
  title,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: BookReaderProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'Escape') onClose();
    },
    [hasPrev, hasNext, onPrev, onNext, onClose],
  );

  return (
    <div
      className="relative flex flex-col h-full"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Book header */}
      <div className="flex items-center justify-between px-6 py-3 bg-leather/80 text-parchment-light rounded-t-lg">
        <button
          onClick={onClose}
          className="text-parchment-dark hover:text-gold-accent transition-colors text-sm"
        >
          &larr; Back to Bookshelf
        </button>
        <h2 className="font-serif text-gold-accent text-lg truncate mx-4">{title}</h2>
        <div className="w-32" /> {/* Spacer for balance */}
      </div>

      {/* Book body with parchment background */}
      <div className="flex-1 flex min-h-0">
        {/* Prev arrow */}
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={`flex-shrink-0 w-12 flex items-center justify-center
            text-3xl transition-colors
            ${hasPrev
              ? 'text-leather hover:text-gold-accent cursor-pointer'
              : 'text-parchment-dark/30 cursor-default'
            }`}
          aria-label="Previous chapter"
        >
          &#8249;
        </button>

        {/* Chapter content */}
        <div className="flex-1 bg-parchment overflow-y-auto book-scroll min-h-0">
          {/* Leather spine visual */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-leather/30 to-transparent" />
            <div className="px-8 py-6 md:px-12 md:py-8">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        </div>

        {/* Next arrow */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`flex-shrink-0 w-12 flex items-center justify-center
            text-3xl transition-colors
            ${hasNext
              ? 'text-leather hover:text-gold-accent cursor-pointer'
              : 'text-parchment-dark/30 cursor-default'
            }`}
          aria-label="Next chapter"
        >
          &#8250;
        </button>
      </div>

      {/* Book shadow/border */}
      <div className="h-2 bg-leather/60 rounded-b-lg shadow-[0_4px_20px_rgba(0,0,0,0.4)]" />
    </div>
  );
}
