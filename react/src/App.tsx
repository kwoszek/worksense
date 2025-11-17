import { Route, Routes } from "react-router-dom";

import DashboardPage from "@/pages/dashboard";
import ForumPage from "@/pages/forum";
import ProgressPage from "@/pages/progress";
import ArticlesPage from "@/pages/articles";
import FocusPage from "@/pages/focus";
import path from "path";

function App() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} path="/dashboard" />
      <Route element={<ForumPage />} path="/forum" />
      <Route element={<ProgressPage />} path="/progress" />
      <Route element={<ArticlesPage />} path="/articles" />
      <Route element={<FocusPage />} path="/focus" />
    </Routes>
  );
}

export default App;
