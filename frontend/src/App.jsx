import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import MoviePage from "./pages/MoviePage";

export default function App() {
  return (
    <div className="min-h-screen text-paper">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MoviePage />} />
      </Routes>
    </div>
  );
}

