
import { ThemeSwitch } from "@/components/theme-switch";
import {Tabs, Tab} from "@heroui/tabs";
import {Route, Routes, useLocation} from "react-router-dom";
import {Avatar, AvatarIcon} from "@heroui/avatar";
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/services/usersApi';

 import { useNavigate } from "react-router-dom";


import DashboardPage from "@/pages/dashboard";
import ForumPage from "@/pages/forum";
import ProgressPage from "@/pages/progress";
import ArticlesPage from "@/pages/articles";
import FocusPage from "@/pages/focus";
import PomodoroSettingsPage from "@/pages/pomodoroSettings";
import AboutPage from "@/pages/about";


export const Navbar = () => {
    const nav = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector(selectAuthUser);
  const [logout] = useLogoutMutation();
 

  return (
    <div className="flex justify-between items-center mt-3 mx-5">
    <h1 className="m-5 text-3xl">WorkSense</h1>
    <div className="flex justify-end m-5 gap-5">

    <ThemeSwitch/>
    {user &&
      <Tabs  aria-label="Tabs" radius="full" selectedKey={pathname} variant="bordered">
          <Tab key="/dashboard" title="Dashboard" href="/dashboard"/>
          <Tab key="/forum" title="Forum" href="forum"/>
          <Tab key="/articles" title="Articles" href="articles" />
          <Tab key="/progress" title="Progress" href="progress"/>
          <Tab key="/focus" title="Focus" href="focus"/>
        </Tabs>
      }
         <Routes>
              <Route index element={<DashboardPage />} path="dashboard" />
              <Route element={<ForumPage />} path="/forum" />
              <Route element={<ProgressPage />} path="/progress" />
              <Route element={<ArticlesPage />} path="/articles" />
               <Route element={<FocusPage />} path="/focus" />
              <Route element={<PomodoroSettingsPage />} path="/focus/settings" />
              <Route element={<AboutPage />} path="/focus/about" />
            </Routes>
        {user && (
          <div className="flex items-center gap-3">
            <Avatar isBordered name={user.username} src="" onClick={() => nav("/profile")}/>
            
          </div>
        )}
    </div>
    </div>
  );
};
