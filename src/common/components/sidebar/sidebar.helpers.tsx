export enum MenuKeys {
  HOME = "home",
  PLANNING = "planning",
  REQUESTS = "requests",
  REPORTS = "reports",
  DAY_WISE_PLAN = "day-wise-plan",
  OVERALL_PLAN = "overall-plan",
  LOAD_GRAPH = "load-graph",
  BILLING = "billing",
  RECS = "recs",
}

export const MENU_ROUTES: Record<MenuKeys, string> = {
  [MenuKeys.HOME]: "/",
  [MenuKeys.PLANNING]: "/consumer",
  [MenuKeys.REQUESTS]: "/generator",
  [MenuKeys.REPORTS]: "/reports",
  [MenuKeys.DAY_WISE_PLAN]: "/reports/day-wise-plan",
  [MenuKeys.OVERALL_PLAN]: "/reports/overall-plan",
  [MenuKeys.LOAD_GRAPH]: "/reports/load-graph",
  [MenuKeys.BILLING]: "/billing",
  [MenuKeys.RECS]: "/recs",
};

export const routeToMenuMap: {
  [pathPrefix: string]: { selectedKey: MenuKeys; openKey?: MenuKeys };
} = {
  [MENU_ROUTES[MenuKeys.HOME]]: { selectedKey: MenuKeys.HOME },
  [MENU_ROUTES[MenuKeys.PLANNING]]: { selectedKey: MenuKeys.PLANNING },
  [MENU_ROUTES[MenuKeys.REQUESTS]]: { selectedKey: MenuKeys.REQUESTS },
  [MENU_ROUTES[MenuKeys.REPORTS]]: { selectedKey: MenuKeys.REPORTS },
  [MENU_ROUTES[MenuKeys.DAY_WISE_PLAN]]: {
    selectedKey: MenuKeys.DAY_WISE_PLAN,
    openKey: MenuKeys.REPORTS,
  },
  [MENU_ROUTES[MenuKeys.OVERALL_PLAN]]: {
    selectedKey: MenuKeys.OVERALL_PLAN,
    openKey: MenuKeys.REPORTS,
  },
  [MENU_ROUTES[MenuKeys.LOAD_GRAPH]]: {
    selectedKey: MenuKeys.LOAD_GRAPH,
    openKey: MenuKeys.REPORTS,
  },
  [MENU_ROUTES[MenuKeys.BILLING]]: { selectedKey: MenuKeys.BILLING },
  [MENU_ROUTES[MenuKeys.RECS]]: { selectedKey: MenuKeys.RECS },
};

export const getMenuKeysFromPathname = (pathname: string) => {
  const matchedEntry = Object.entries(routeToMenuMap)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([prefix]) => pathname.startsWith(prefix));

  if (!matchedEntry) return { selectedKey: "", openKey: undefined };

  const [, { selectedKey, openKey }] = matchedEntry;
  return { selectedKey, openKey };
};
