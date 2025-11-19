import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { store } from './store';
import { useHref, useNavigate } from "react-router-dom";
import { useMeQuery } from '@/services/usersApi';
import { selectAuthUser, selectAuthToken } from '@/features/auth/authSlice';

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const user = useSelector(selectAuthUser);
  const token = useSelector(selectAuthToken);
  // Fire /me as early as possible on any page load if we have a token but no user
  useMeQuery(undefined, { skip: !token || !!user });
  return <>{children}</>;
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <ReduxProvider store={store}>
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <AuthBootstrap>
          {children}
        </AuthBootstrap>
      </HeroUIProvider>
    </ReduxProvider>
  );
}
