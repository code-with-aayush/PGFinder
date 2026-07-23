"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import axios from "axios";

export type UserRole = "student" | "owner" | null;

export function useUserRole() {
  const { user, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isClerkLoaded) return;

    if (!isSignedIn || !user) {
      setRole(null);
      setLoading(false);
      return;
    }

    // 1. Check Clerk publicMetadata first
    const metadataRole = user.publicMetadata?.role as UserRole | undefined;
    if (metadataRole === "student" || metadataRole === "owner") {
      setRole(metadataRole);
      setLoading(false);
      return;
    }

    // 2. Fallback: Query MongoDB via API to sync & get role
    axios
      .get("/api/users/me")
      .then((res) => {
        if (res.data?.user?.role) {
          setRole(res.data.user.role as UserRole);
        } else {
          setRole(null);
        }
      })
      .catch(() => {
        setRole(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isClerkLoaded, isSignedIn, user]);

  return {
    role,
    loading: loading || !isClerkLoaded,
    isStudent: role === "student",
    isOwner: role === "owner",
    isLoggedIn: !!isSignedIn,
    user,
  };
}
