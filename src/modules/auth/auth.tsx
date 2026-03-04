import RootLayout from "@/common/layouts/root-layout";
import { useGlobals } from "@/common/context/globals";
import { Card, Typography } from "antd";
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
import Image from "next/image";

const { Text } = Typography;

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
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Image
              src="/assets/images/reportal-logo.png"
              width={256}
              height={256}
              alt="Logo"
              className="mx-auto mb-4 w-64 object-contain"
            />
            <Text className="text-gray-500">
              An RE Management and Transaction Platform
            </Text>
          </div>
          <Card className="w-full max-w-md border border-gray-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]!">
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
        </div>
      </main>
    </RootLayout>
  );
};

export default AuthPage;
