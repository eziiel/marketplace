import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { crumbs } from "@/components/layout/crumbs";
import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useLogout } from "@/features/auth/hooks/use-logout";

import { ProfileSidebar, type ProfileSection } from "./profile-sidebar";

export function ProfileShell({
  active,
  current,
  children,
}: {
  active: ProfileSection;
  current: string;
  children: ReactNode;
}) {
  const isAuthenticated = Boolean(getAuthToken());
  const authMe = useAuthMe();
  const logoutMutation = useLogout();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        isAuthenticated={isAuthenticated}
        userName={authMe.data?.user.name}
        onLogout={() => logoutMutation.mutate()}
      />

      <main className="flex-1 pb-6 md:pb-0">
        <Container className="py-6 md:py-8">
          <Breadcrumb
            items={[crumbs.home]}
            current={current}
            className="mb-5"
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:gap-7">
            <ProfileSidebar
              active={active}
              onLogout={() => logoutMutation.mutate()}
            />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </Container>
      </main>

      <SiteFooter />
      <MobileNav />
    </div>
  );
}
