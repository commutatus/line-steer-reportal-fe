import { STORAGE_PREFIX } from "@/common/constants/global";

const createStorageKey = (key: string) => {
  return `${STORAGE_PREFIX}-${key}`;
};

export const ACCESS_TOKEN_KEY = createStorageKey("access-token");
export const REFRESH_TOKEN_KEY = createStorageKey("refresh-token");
