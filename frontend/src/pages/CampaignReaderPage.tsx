import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookReader from '../components/BookReader';
import ChapterNav from '../components/ChapterNav';
import { listChapters, getChapter, getCharacters, getOverview } from '../api/campaigns';
import type { ChapterSummary, CampaignOverview } from '../types/campaign';

export default function CampaignReaderPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isCharactersView, setIsCharactersView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [overview, setOverview] = useState<CampaignOverview | null>(null);

  // Load chapter list
  useEffect(() => {
    if (!slug) return;
    listChapters(slug).then((chs) => {
      setChapters(chs);
      if (chs.length > 0) {
        loadChapter(slug, chs[0].filename);
      }
      setLoading(false);
    });
  }, [slug]);

  // Load overview for rpgdashboard link
  useEffect(() => {
    if (!slug) return;
    getOverview(slug).then(setOverview).catch(() => {});
  }, [slug]);

  const loadChapter = useCallback(
    (campaignSlug: string, filename: string) => {
      setLoading(true);
      setIsCharactersView(false);
      getChapter(campaignSlug, filename).then((ch) => {
        setContent(ch.content);
        setTitle(ch.title);
        const idx = chapters.findIndex((c) => c.filename === filename);
        if (idx >= 0) setCurrentIndex(idx);
        setLoading(false);
        setNavOpen(false);
      });
    },
    [chapters],
  );

  const loadCharacters = useCallback(() => {
    if (!slug) return;
    setLoading(true);
    setIsCharactersView(true);
    getCharacters(slug).then((ch) => {
      setContent(ch.content);
      setTitle('Characters');
      setLoading(false);
      setNavOpen(false);
    });
  }, [slug]);

  const handleSelectChapter = useCallback(
    (filename: string) => {
      if (!slug) return;
      const idx = chapters.findIndex((c) => c.filename === filename);
      if (idx >= 0) setCurrentIndex(idx);
      loadChapter(slug, filename);
    },
    [slug, chapters, loadChapter],
  );

  const handlePrev = useCallback(() => {
    if (!slug || currentIndex <= 0) return;
    const prev = chapters[currentIndex - 1];
    setCurrentIndex(currentIndex - 1);
    loadChapter(slug, prev.filename);
  }, [slug, currentIndex, chapters, loadChapter]);

  const handleNext = useCallback(() => {
    if (!slug || currentIndex >= chapters.length - 1) return;
    const next = chapters[currentIndex + 1];
    setCurrentIndex(currentIndex + 1);
    loadChapter(slug, next.filename);
  }, [slug, currentIndex, chapters, loadChapter]);

  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);

  if (!slug) return null;

  return (
    <div className="h-screen bg-castle-dark flex flex-col md:flex-row">
      {/* Mobile nav toggle */}
      <button
        onClick={() => setNavOpen(!navOpen)}
        className="md:hidden fixed top-3 left-3 z-50 bg-leather text-gold-accent px-3 py-1.5 rounded shadow-lg text-sm"
      >
        {navOpen ? 'Close' : 'Chapters'}
      </button>

      {/* Chapter navigation sidebar */}
      <aside
        className={`
          fixed md:static inset-0 z-40 md:z-auto
          w-72 flex-shrink-0 p-3 overflow-y-auto
          transition-transform duration-300
          ${navOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          bg-castle-dark/95 md:bg-transparent
        `}
      >
        <div className="mt-12 md:mt-0">
          {overview?.rpgdashboardUrl && (
            <a
              href={overview.rpgdashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-3 px-3 py-2 text-sm text-center rounded border border-gold-accent/40 text-gold-accent hover:bg-gold-accent/10 transition-colors"
            >
              Campaign Dashboard
            </a>
          )}
          <ChapterNav
            chapters={chapters}
            currentFilename={chapters[currentIndex]?.filename ?? null}
            onSelectChapter={handleSelectChapter}
            onSelectCharacters={loadCharacters}
            isCharactersView={isCharactersView}
          />
        </div>
      </aside>

      {/* Backdrop for mobile nav */}
      {navOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Book reader main area — scrollable */}
      <main className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-parchment-dark text-lg">Loading...</p>
          </div>
        ) : (
          <BookReader
            content={content}
            title={title}
            hasPrev={!isCharactersView && currentIndex > 0}
            hasNext={!isCharactersView && currentIndex < chapters.length - 1}
            onPrev={handlePrev}
            onNext={handleNext}
            onClose={handleClose}
          />
        )}
      </main>
    </div>
  );
}
