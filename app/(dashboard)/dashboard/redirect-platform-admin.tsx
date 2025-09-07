"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RedirectPlatformAdmin({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  
  useEffect(() => {
    // List of platform admin emails
    const platformAdminEmails = ['prodiuscristian@gmail.com'];
    
    if (userEmail && platformAdminEmails.includes(userEmail)) {
      router.replace('/dashboard/platform-admin');
    }
  }, [userEmail, router]);
  
  return null;
}