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
      className="book-reader-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Top bar overlaid on the image */}
      <div className="book-reader-topbar">
        <button
          onClick={onClose}
          className="text-parchment-dark hover:text-gold-accent transition-colors text-sm drop-shadow-md"
        >
          &larr; Back to Bookshelf
        </button>
        <h2 className="font-serif text-gold-accent text-lg truncate mx-4 drop-shadow-md">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`px-3 py-1 rounded text-sm font-serif transition-colors drop-shadow-md
              ${hasPrev
                ? 'text-parchment-light hover:text-gold-accent'
                : 'text-parchment-dark/30 cursor-default'
              }`}
          >
            &larr; Prev
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`px-3 py-1 rounded text-sm font-serif transition-colors drop-shadow-md
              ${hasNext
                ? 'text-parchment-light hover:text-gold-accent'
                : 'text-parchment-dark/30 cursor-default'
              }`}
          >
            Next &rarr;
          </button>
        </div>
      </div>

      {/* Book image container */}
      <div className="book-reader-image-wrapper">
        <img
          src="/book-bg.png"
          alt="Open book"
          className="book-reader-image"
          draggable={false}
        />

        {/* Text overlay positioned on the blank page */}
        <div className="book-reader-text-area book-scroll">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
}
