export enum MenuKeys {
  PLANNING = "planning",
  REQUESTS = "requests",
  REPORTS = "reports",
  DAY_WISE_PLAN = "day-wise-plan",
  OVERALL_PLAN = "overall-plan",
  LOAD_GRAPH = "load-graph",
}

export const routeToMenuMap: {
  [pathPrefix: string]: { selectedKey: MenuKeys; openKey?: MenuKeys };
} = {
  "/": { selectedKey: MenuKeys.PLANNING },
  "/consumer": { selectedKey: MenuKeys.PLANNING },
  "/generator": { selectedKey: MenuKeys.REQUESTS },
  "/reports": { selectedKey: MenuKeys.REPORTS },
  "/reports/day-wise-plan": {
    selectedKey: MenuKeys.DAY_WISE_PLAN,
    openKey: MenuKeys.REPORTS,
  },
  "/reports/overall-plan": {
    selectedKey: MenuKeys.OVERALL_PLAN,
    openKey: MenuKeys.REPORTS,
  },
  "/reports/load-graph": {
    selectedKey: MenuKeys.LOAD_GRAPH,
    openKey: MenuKeys.REPORTS,
  },
};

export const getMenuKeysFromPathname = (pathname: string) => {
  const matchedEntry = Object.entries(routeToMenuMap)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([prefix]) => pathname.startsWith(prefix));

  if (!matchedEntry) return { selectedKey: "", openKey: undefined };

  const [, { selectedKey, openKey }] = matchedEntry;
  return { selectedKey, openKey };
};
