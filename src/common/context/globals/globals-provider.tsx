"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import useAuth from "./useAuth";
import { notification } from "antd";
import { AuthPageStates } from "@/modules/auth";
import { NotificationInstance } from "antd/es/notification/interface";

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
      authPageState,
      setAuthPageState,
      showLogin,
      showVerifyOtp,
    };
  }, [authContext, notificationApi, currentUser, isSidebarCollapsed, authPageState, setAuthPageState, showLogin, showVerifyOtp]);

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
