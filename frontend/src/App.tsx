import { Routes, Route } from 'react-router-dom';
import BookshelfPage from './pages/BookshelfPage';
import CampaignReaderPage from './pages/CampaignReaderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BookshelfPage />} />
      <Route path="/campaign/:slug" element={<CampaignReaderPage />} />
    </Routes>
  );
}
