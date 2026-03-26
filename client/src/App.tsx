import { Route, Routes } from "react-router";

import HomePage from "@/pages/HomePage";
import ScrapeDetailPage from "@/pages/ScrapeDetailPage";

function App() {
  return (
    <div className="py-4 px-10">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scrape/:scrapeBatchId" element={<ScrapeDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
