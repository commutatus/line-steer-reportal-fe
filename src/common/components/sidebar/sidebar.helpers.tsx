import { RoutePaths } from "@/common/utils/constants";


export const routeToMenuMap: {
  [pathPrefix: string]: { selectedKey: RoutePaths; openKey?: RoutePaths };
} = {
  [RoutePaths.HOME]: { selectedKey: RoutePaths.HOME },
  [RoutePaths.PLANNING]: { selectedKey: RoutePaths.PLANNING },
  [RoutePaths.REQUESTS]: { selectedKey: RoutePaths.REQUESTS },
  [RoutePaths.REPORTS]: { selectedKey: RoutePaths.REPORTS },
  [RoutePaths.DAY_WISE_PLAN]: {
    selectedKey: RoutePaths.DAY_WISE_PLAN,
    openKey: RoutePaths.REPORTS,
  },
  [RoutePaths.OVERALL_PLAN]: {
    selectedKey: RoutePaths.OVERALL_PLAN,
    openKey: RoutePaths.REPORTS,
  },
  [RoutePaths.LOAD_GRAPH]: {
    selectedKey: RoutePaths.LOAD_GRAPH,
    openKey: RoutePaths.REPORTS,
  },
  [RoutePaths.BILLING]: { selectedKey: RoutePaths.BILLING },
  [RoutePaths.RECS]: { selectedKey: RoutePaths.RECS },
};

export const getMenuKeysFromPathname = (pathname: string) => {
  const matchedEntry = Object.entries(routeToMenuMap)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([prefix]) => pathname.startsWith(prefix));

  if (!matchedEntry) return { selectedKey: "", openKey: undefined };

  const [, { selectedKey, openKey }] = matchedEntry;
  return { selectedKey, openKey };
};
