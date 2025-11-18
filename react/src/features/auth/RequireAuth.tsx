import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { selectAuthUser, selectAuthToken } from '@/features/auth/authSlice';
import { useMeQuery } from '@/services/usersApi';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const user = useSelector(selectAuthUser);
  const token = useSelector(selectAuthToken);
  const shouldFetchMe = !!token && !user;
  const { isFetching } = useMeQuery(undefined, { skip: !shouldFetchMe });
  const location = useLocation();
  if (shouldFetchMe || isFetching) {
    return null; // allow /me to hydrate auth before deciding
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
