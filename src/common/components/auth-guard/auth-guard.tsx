"use client";

import {
  ROOT_ROUTE_LOGGED_IN,
  ROOT_ROUTE_LOGGED_OUT,
} from "@/common/constants/global";
import { AuthStatesEnum, useGlobals } from "@/common/context/globals";
import { UserType } from "@/common/hooks/useCurrentUser";
import { RoutePaths } from "@/common/utils/constants";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

const loggedOutRoutes = [ROOT_ROUTE_LOGGED_OUT];

const ALLOWED_PATHS: Record<UserType, string[]> = {
  [UserType.CONSUMER]: [RoutePaths.PLANNING, RoutePaths.DAY_WISE_PLAN, RoutePaths.OVERALL_PLAN, RoutePaths.LOAD_GRAPH],
  [UserType.GENERATOR]: [RoutePaths.REQUESTS, RoutePaths.DAY_WISE_PLAN, RoutePaths.OVERALL_PLAN, RoutePaths.LOAD_GRAPH, RoutePaths.BILLING, RoutePaths.RECS],
};

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { auth, currentUser } = useGlobals();

  useEffect(() => {
    if (!pathname || auth?.state === AuthStatesEnum.initial) {
      return;
    }

    const isOnLoggedOutRoute = loggedOutRoutes.some((routePrefix) =>
      pathname.startsWith(routePrefix)
    );

    if (auth?.state === AuthStatesEnum.loggedIn) {
      if (currentUser?.userType) {
        const allowedPaths = ALLOWED_PATHS[currentUser.userType];
        if (isOnLoggedOutRoute || !allowedPaths.includes(pathname)) {
          router.replace(allowedPaths[0]);
        }
        return;
      }
      if (isOnLoggedOutRoute) {
        router.replace(ROOT_ROUTE_LOGGED_IN);
      }
    } else if (!isOnLoggedOutRoute) {
      router.replace(ROOT_ROUTE_LOGGED_OUT);
    }
  }, [auth?.state, pathname, router, currentUser?.userType]);

  return <>{children}</>;
};
