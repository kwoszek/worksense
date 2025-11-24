
import { ThemeSwitch } from "@/components/theme-switch";
import { Tabs, Tab } from "@heroui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@heroui/avatar";
import { getStreakColor } from '@/utils/streak';
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
        <h1 className="text-3xl cursor-pointer" onClick={() => nav("/")}>WorkSense</h1>

        <div className="flex items-center gap-4">
          <ThemeSwitch />

          {/* Desktop tabs - hidden on small screens */}
          <div className="hidden md:block">
            <Tabs aria-label="Tabs" radius="full" selectedKey={pathname} variant="bordered">
              {user && <Tab key="/dashboard" title="Dashboard" href="/dashboard" />}
              <Tab key="/forum" title="Forum" href="/forum" />
              <Tab key="/articles" title="Artykuły" href="/articles" />                            
              {user && <Tab key="/progress" title="Progres" href="/progress" />}
              <Tab key="/focus" title="Focus" href="/focus" />
            </Tabs>
          </div>

          {/* auth / avatar */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <div style={{ borderRadius: 9999, padding: 2, display: 'inline-block', border: `3px solid ${getStreakColor(user?.streak)}` }}>
                <Avatar isBordered name={user.username} src={user?.avatar ? `data:image/png;base64,${user.avatar}` : undefined} onClick={() => nav("/profile")} />
              </div>
            </div>
          ) : (
            <div className="hidden md:block">
              <Button color="success" radius="full" onPress={() => nav("/login")}>Login</Button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => {setMobileOpen((s) => !s)}}
              className="p-2 rounded-md border"
            >
              <div className="flex flex-col overflow-hidden">
              <span className={"ham a w-[25px] h-[2px] bg-foreground "+ mobileOpen.toString()}></span>
               <span className={"ham b w-[25px] h-[2px] bg-foreground mt-1.5 "+ mobileOpen.toString()}></span>
                <span className={"ham c w-[25px] h-[2px] bg-foreground mt-1.5 "+ mobileOpen.toString()}></span>
                </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <nav className="md:hidden border-t -mt-7 mobile">
            <div className="px-4 py-3 space-y-2">
             
              {user && <button onClick={() => { nav('/dashboard'); setMobileOpen(false); }} className="w-full text-left">Dashboard</button>}
              <button onClick={() => { nav('/forum'); setMobileOpen(false); }} className="w-full text-left">Forum</button>
              <button onClick={() => { nav('/articles'); setMobileOpen(false); }} className="w-full text-left">Artykuły</button>
                            {user &&  <button onClick={() => { nav('/progress'); setMobileOpen(false); }} className="w-full text-left">Progres</button>}
              <button onClick={() => { nav('/focus'); setMobileOpen(false); }} className="w-full text-left">Focus</button>

              
              

              {user && <div className="pt-2">
                    <button onClick={() => { nav('/profile'); setMobileOpen(false); }} className="w-full text-left">Profil</button>
                  </div>}
                
                  
                 
                  
                
              

              {!user && (
                <button onClick={() => { nav('/login'); setMobileOpen(false); }} className="w-full text-left">Login</button>
              )}
            </div>
        </nav>
      )}
    </header>
  );
};
