import RootLayout from "@/common/layouts/root-layout";
import { useGlobals } from "@/common/context/globals";
import { Card } from "antd";
import { useState } from "react";
import { AuthPageStates } from "./auth-page.types";
import Login from "./login";
import VerifyOtp from "./verify-otp";
import { useMutation } from "@apollo/client";
import {
  RequestOtpMutation,
  RequestOtpMutationVariables,
} from "@/generated/graphql";
import { REQUEST_OTP } from "@/common/graphql/auth";

const AuthPage = () => {
  const { authPageState, showLogin, showVerifyOtp } = useGlobals();
  const [userEmail, setUserEmail] = useState<string>("");
  const [requestOtp, { loading: isRequestingOtp }] = useMutation<
    RequestOtpMutation,
    RequestOtpMutationVariables
  >(REQUEST_OTP);

  return (
    <RootLayout
      pageTitle="Auth"
      shouldShowNavbar={false}
      shouldShowSidebar={false}
    >
      <main className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-white via-[#ea3227]/5 to-[#ea3227]/15">
        <Card className="w-full max-w-md shadow-[0px_4px_24px_rgba(0,0,0,0.08)]">
          {authPageState === AuthPageStates.login ? (
            <Login
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              showVerifyOtp={showVerifyOtp}
              requestOtp={requestOtp}
              isRequestingOtp={isRequestingOtp}
            />
          ) : (
            <VerifyOtp
              userEmail={userEmail}
              showLogin={showLogin}
              requestOtp={requestOtp}
              isRequestingOtp={isRequestingOtp}
            />
          )}
        </Card>
      </main>
    </RootLayout>
  );
};

export default AuthPage;
