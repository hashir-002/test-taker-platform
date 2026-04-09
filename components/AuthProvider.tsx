"use client";

import { auth } from "@/firebase/config";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  type User,
} from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { database } from "@/firebase/config";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
  user: User | null;
  role: string | null;
  loading: boolean;
};

const PUBLIC_ROUTES = new Set([
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/admin/register",
]);

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {
      // If persistence fails, continue with default browser behavior.
    });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    const userRef = ref(database, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const value = snapshot.val() as { role?: string } | null;
      setRole(value?.role ?? null);
      setRoleLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const isPublicRoute = pathname ? PUBLIC_ROUTES.has(pathname) : false;

    if (!user && !isPublicRoute) {
      router.replace("/auth/login");
    }
  }, [authLoading, pathname, router, user]);

  const loading = authLoading || roleLoading;

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
    }),
    [loading, role, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
