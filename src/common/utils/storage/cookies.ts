import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

export const setCookie = (key: string, value: string) => {
  cookies.set(key, value);
};

export const getCookie = (key: string) => {
  return cookies.get(key);
};

export const removeCookie = (key: string) => {
  cookies.remove(key);
};
