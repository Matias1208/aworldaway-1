import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Results from "./pages/Results";        // ✅ export default
import PlanetDetail from "./pages/PlanetDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/results" element={<Results />} />
      <Route path="/planet/:id" element={<PlanetDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
