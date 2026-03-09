"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { useApolloClient } from "@apollo/client";
import useAuth from "./useAuth";
import { notification } from "antd";
import { AuthPageStates } from "@/modules/auth";
import { NotificationInstance } from "antd/es/notification/interface";
import useCurrentUser from "@/common/hooks/useCurrentUser";
import useCurrentPark from "./useCurrentPark";

type GlobalsContextType = Partial<{
  auth: ReturnType<typeof useAuth>;
  currentUser: ReturnType<typeof useCurrentUser>;
  currentPark: ReturnType<typeof useCurrentPark>;
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
  const apolloClient = useApolloClient();
  const authContext = useAuth();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification({
      duration: 3,
    });
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

  const currentPark = useCurrentPark({
    authState: authContext.state,
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleLogout = useCallback(() => {
    authContext.logout();
    currentPark.resetPark();
    setAuthPageState?.(AuthPageStates.login);
    apolloClient.resetStore(); // Clear Apollo cache on logout
  }, [authContext, currentPark, apolloClient, setAuthPageState]);

  const contextValue = useMemo(() => {
    return {
      auth: { ...authContext, logout: handleLogout },
      notificationApi,
      currentUser,
      currentPark,
      isSidebarCollapsed,
      toggleSidebarCollapse,
      authPageState,
      setAuthPageState,
      showLogin,
      showVerifyOtp,
    };
  }, [authContext, notificationApi, currentUser, currentPark, isSidebarCollapsed, authPageState, setAuthPageState, showLogin, showVerifyOtp, handleLogout]);

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
