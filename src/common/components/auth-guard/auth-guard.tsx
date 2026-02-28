"use client";

import {
  ROOT_ROUTE_LOGGED_IN,
  ROOT_ROUTE_LOGGED_OUT,
} from "@/common/constants/global";
import { AuthStatesEnum, useGlobals } from "@/common/context/globals";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

const loggedOutRoutes = [ROOT_ROUTE_LOGGED_OUT];

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { auth } = useGlobals();

  useEffect(() => {
    if (!pathname || auth?.state === AuthStatesEnum.initial) {
      return;
    }

    const isOnLoggedOutRoute = loggedOutRoutes.some((routePrefix) =>
      pathname.startsWith(routePrefix)
    );

    if (auth?.state === AuthStatesEnum.loggedIn) {
      if (isOnLoggedOutRoute) {
        router.replace(ROOT_ROUTE_LOGGED_IN);
      }
    } else if (!isOnLoggedOutRoute) {
      router.replace(ROOT_ROUTE_LOGGED_OUT);
    }
  }, [auth?.state, pathname, router]);

  return <>{children}</>;
};
