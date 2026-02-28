import {
  ACCESS_TOKEN_KEY,
  getCookie,
  REFRESH_TOKEN_KEY,
  removeCookie,
  setCookie,
} from "@/common/utils/storage";

export const getAccessToken = () => {
  return getCookie(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  return getCookie(REFRESH_TOKEN_KEY);
};

export const updateAccessToken = (accessToken: string) => {
  setCookie(ACCESS_TOKEN_KEY, accessToken);
};

export const updateRefreshToken = (refreshToken: string) => {
  setCookie(REFRESH_TOKEN_KEY, refreshToken);
};

export const removeApiTokens = () => {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
};
