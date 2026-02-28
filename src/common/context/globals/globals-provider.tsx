"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import useAuth from "./useAuth";
import { notification } from "antd";

type GlobalsContextType = Partial<{
  auth: ReturnType<typeof useAuth>;
}>;

const GlobalsContext = createContext<GlobalsContextType>({});

export const GlobalsProvider = ({ children }: { children: ReactNode }) => {
  const authContext = useAuth();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  const contextValue = useMemo(() => {
    return {
      auth: authContext,
      notificationApi,
    };
  }, [authContext, notificationApi]);

  return (
    <GlobalsContext.Provider value={contextValue}>
      {notificationContextHolder}
      {children}
    </GlobalsContext.Provider>
  );
};

export const useGlobals = () => {
  const contextValue = useContext(GlobalsContext);

  return contextValue;
};
