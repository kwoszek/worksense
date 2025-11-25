import { Route, Routes, Navigate } from "react-router-dom";
import DashboardPage from "@/pages/dashboard";
import ForumPage from "@/pages/forum";
import ProgressPage from "@/pages/progress";
import ArticlesPage from "@/pages/articles";
import FocusPage from "@/pages/focus";
import PomodoroSettingsPage from "@/pages/pomodoroSettings";
import LoginPage from "./pages/login";
import RequireAuth from "@/features/auth/RequireAuth";
import Profile from "@/pages/profile";
import Landing from "@/pages/landing";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import NotFoundPage from "@/pages/404";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
  <Route path="/forum" element={<ForumPage />} />
  <Route path="/progress" element={<RequireAuth><ProgressPage /></RequireAuth>} />
  <Route path="/articles" element={<ArticlesPage />} />
     
  <Route path="/focus" element={<FocusPage />} />
  <Route path="/focus/settings" element={<PomodoroSettingsPage />} />
  <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
  <Route path="/terms" element={<TermsPage />} />
  <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage/>} />
    </Routes>
  );
}

export default App;
