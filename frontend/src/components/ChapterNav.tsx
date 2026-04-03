import type { ChapterSummary } from '../types/campaign';

interface ChapterNavProps {
  chapters: ChapterSummary[];
  currentFilename: string | null;
  onSelectChapter: (filename: string) => void;
  onSelectCharacters: () => void;
  isCharactersView: boolean;
}

export default function ChapterNav({
  chapters,
  currentFilename,
  onSelectChapter,
  onSelectCharacters,
  isCharactersView,
}: ChapterNavProps) {
  return (
    <nav className="bg-leather/90 text-parchment-light p-4 rounded-lg shadow-lg">
      <h2 className="text-gold-accent font-serif text-lg mb-3 border-b border-gold-accent/30 pb-2">
        Table of Contents
      </h2>
      <ul className="space-y-1">
        {chapters.map((ch) => (
          <li key={ch.filename}>
            <button
              onClick={() => onSelectChapter(ch.filename)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors
                ${currentFilename === ch.filename && !isCharactersView
                  ? 'bg-gold-accent/20 text-gold-accent'
                  : 'hover:bg-parchment/10'
                }`}
            >
              <span className="block font-medium">{ch.title}</span>
              {ch.sessionDate && (
                <span className="block text-xs text-parchment-dark mt-0.5">{ch.sessionDate}</span>
              )}
            </button>
          </li>
        ))}
        <li className="pt-2 border-t border-gold-accent/20 mt-2">
          <button
            onClick={onSelectCharacters}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors
              ${isCharactersView
                ? 'bg-gold-accent/20 text-gold-accent'
                : 'hover:bg-parchment/10'
              }`}
          >
            <span className="block font-medium">Characters</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
