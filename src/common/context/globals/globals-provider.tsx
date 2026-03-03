"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import useAuth from "./useAuth";
import { notification } from "antd";
import { AuthPageStates } from "@/modules/auth";
import { NotificationInstance } from "antd/es/notification/interface";
import useCurrentUser from "@/common/hooks/useCurrentUser";

type GlobalsContextType = Partial<{
  auth: ReturnType<typeof useAuth>;
  currentUser: ReturnType<typeof useCurrentUser>;
  notificationApi: NotificationInstance;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  authPageState: AuthPageStates,
  setAuthPageState: React.Dispatch<React.SetStateAction<AuthPageStates>>,
  showLogin: () => void,
  showVerifyOtp: () => void,
}>;

const GlobalsContext = createContext<GlobalsContextType>({});

export const GlobalsProvider = ({ children }: { children: ReactNode }) => {
  const authContext = useAuth();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();
  const [authPageState, setAuthPageState] = useState<AuthPageStates>(
    AuthPageStates.login
  );

  const showVerifyOtp = useCallback(() => {
    setAuthPageState?.(AuthPageStates.verifyOtp);
  }, [setAuthPageState]);

  const showLogin = useCallback(() => {
    setAuthPageState?.(AuthPageStates.login);
  }, [setAuthPageState]);

  const currentUser = useCurrentUser({
    authState: authContext.state,
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleLogout = useCallback(() => {
    authContext.logout();
    setAuthPageState?.(AuthPageStates.login);
  }, [authContext, setAuthPageState]);

  const contextValue = useMemo(() => {
    return {
      auth: { ...authContext, logout: handleLogout },
      notificationApi,
      currentUser,
      isSidebarCollapsed,
      toggleSidebarCollapse,
      authPageState,
      setAuthPageState,
      showLogin,
      showVerifyOtp,
    };
  }, [authContext, notificationApi, currentUser, isSidebarCollapsed, authPageState, setAuthPageState, showLogin, showVerifyOtp, handleLogout]);

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
