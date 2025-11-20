
import { ThemeSwitch } from "@/components/theme-switch";
import { Tabs, Tab } from "@heroui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@heroui/avatar";
import { useSelector } from "react-redux";
import { selectAuthUser } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/services/usersApi';
// page routes are defined in App.tsx; navbar only navigates
import { Button } from "@heroui/button";
import { useState } from "react";


export const Navbar = () => {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector(selectAuthUser);
  useLogoutMutation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full">
      <div className="flex items-center justify-between mt-8 px-4 sm:px-6 lg:px-8 mb-13">
        <h1 className="text-3xl cursor-pointer underline" onClick={() => nav("/")}>WorkSense</h1>

        <div className="flex items-center gap-4">
          <ThemeSwitch />

          {/* Desktop tabs - hidden on small screens */}
          <div className="hidden sm:block">
            <Tabs aria-label="Tabs" radius="full" selectedKey={pathname} variant="bordered">
              {user && <Tab key="/dashboard" title="Dashboard" href="/dashboard" />}
              <Tab key="/forum" title="Forum" href="/forum" />
              <Tab key="/articles" title="Artykuły" href="/articles" />                            
              {user && <Tab key="/progress" title="Progress" href="/progress" />}
              <Tab key="/focus" title="Focus" href="/focus" />
            </Tabs>
          </div>

          {/* auth / avatar */}
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Avatar isBordered name={user.username} src={user?.avatar ? `data:image/png;base64,${user.avatar}` : undefined} onClick={() => nav("/profile")} />
            </div>
          ) : (
            <div className="hidden sm:block">
              <Button color="success" radius="full" onPress={() => nav("/login")}>Login</Button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((s) => !s)}
              className="p-2 rounded-md border"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <nav className="sm:hidden border-t">
            <div className="px-4 py-3 space-y-2">
              {/* public links */}
              <button onClick={() => { nav('/forum'); setMobileOpen(false); }} className="w-full text-left">Forum</button>
              <button onClick={() => { nav('/articles'); setMobileOpen(false); }} className="w-full text-left">Artykuły</button>
              <button onClick={() => { nav('/focus'); setMobileOpen(false); }} className="w-full text-left">Focus</button>

              {/* protected links */}
              {user && (
                <>
                  <button onClick={() => { nav('/dashboard'); setMobileOpen(false); }} className="w-full text-left">Dashboard</button>
                  <button onClick={() => { nav('/progress'); setMobileOpen(false); }} className="w-full text-left">Progress</button>
                  <div className="pt-2">
                    <button onClick={() => { nav('/profile'); setMobileOpen(false); }} className="w-full text-left">Profil</button>
                  </div>
                </>
              )}

              {!user && (
                <button onClick={() => { nav('/login'); setMobileOpen(false); }} className="w-full text-left">Login</button>
              )}
            </div>
        </nav>
      )}
    </header>
  );
};
