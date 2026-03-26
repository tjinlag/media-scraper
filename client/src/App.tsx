import { Route, Routes } from "react-router";

import HomePage from "@/pages/HomePage";
import ScrapeDetailPage from "@/pages/ScrapeDetailPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scrape/:scrapeBatchId" element={<ScrapeDetailPage />} />
      </Routes>
    </>
  );
}

export default App;
