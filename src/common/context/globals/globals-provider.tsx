"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import useAuth from "./useAuth";
import { notification } from "antd";

type GlobalsContextType = Partial<{
  auth: ReturnType<typeof useAuth>;
  // TODO: Current user is static for now
  currentUser: {
    data: {
      email: string;
      firstname: string;
      lastname: string;
    };
  };
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
}>;

const GlobalsContext = createContext<GlobalsContextType>({});

export const GlobalsProvider = ({ children }: { children: ReactNode }) => {
  const authContext = useAuth();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  // TODO: Current user is static for now
  const currentUser = useMemo(
    () => ({
      data: {
        email: "john.doe@example.com",
        firstname: "John",
        lastname: "Doe",
      },
    }),
    [],
  );

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const contextValue = useMemo(() => {
    return {
      auth: authContext,
      notificationApi,
      currentUser,
      isSidebarCollapsed,
      toggleSidebarCollapse,
    };
  }, [authContext, notificationApi, currentUser, isSidebarCollapsed]);

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
