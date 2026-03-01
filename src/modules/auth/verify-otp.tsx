import { useGlobals } from "@/common/context/globals";
import { VERIFY_OTP } from "@/common/graphql/auth";
import {
  RequestOtpMutation,
  RequestOtpMutationVariables,
  VerifyOtpMutation,
  VerifyOtpMutationVariables,
} from "@/generated/graphql";
import { useMutation } from "@apollo/client";
import { Button, Form, Input, Typography } from "antd";
import { useEffect, useState } from "react";

type VerifyOtpProps = {
  userEmail?: string;
  showLogin?: () => void;
  requestOtp?: ReturnType<
    typeof useMutation<RequestOtpMutation, RequestOtpMutationVariables>
  >[0];
  isRequestingOtp?: boolean;
};

const OTP_COOLDOWN_SECONDS = 30;

const parseOtpTime = (seconds: number) => {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

const VerifyOtp = (props: VerifyOtpProps) => {
  const [otpValue, setOtpValue] = useState<string>("");
  const [otpTimeRemaining, setOtpTimeRemaining] =
    useState<number>(OTP_COOLDOWN_SECONDS);
  const [verifyOtp, { loading: verifyingOtp }] = useMutation<
    VerifyOtpMutation,
    VerifyOtpMutationVariables
  >(VERIFY_OTP);
  const { notificationApi, auth } = useGlobals();

  useEffect(() => {
    if (otpTimeRemaining === 0) {
      return;
    }

    const timer = setInterval(() => {
      setOtpTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimeRemaining]);

  const canResendOtp = otpTimeRemaining <= 0;

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpValue(e.target.value);
  };

  const handleVerifyOtp = () => {
    if (!otpValue || !props.userEmail) {
      return;
    }

    const variables: VerifyOtpMutationVariables = {
      input: {
        email: props.userEmail,
        otp: otpValue,
      },
    };

    verifyOtp({
      variables,
    })
      .then((res) => {
        const { accessToken, refreshToken } = res.data?.verifyOtp ?? {};
        if (!accessToken) {
          notificationApi?.error({
            message: "Invalid OTP. Please try again.",
          });
          return;
        }
        auth?.onLoginSuccess({
          accessToken,
          refreshToken,
        });
        props.showLogin?.();
      })
      .catch((error) => {
        const message =
          error?.cause?.message ??
          error?.message ??
          "An error occurred during OTP verification.";

        notificationApi?.error({
          message,
        });
      });
  };

  const handleRequestOtp = () => {
    if (!props.requestOtp || props.isRequestingOtp || !props.userEmail) {
      return;
    }

    props
      .requestOtp({
        variables: {
          input: {
            email: props.userEmail,
          },
        },
      })
      .catch((error) => {
        notificationApi?.error({
          message: error?.message ?? "Failed to request OTP. Please try again.",
        });
      });
  };

  const handleResendOtp = () => {
    setOtpTimeRemaining(OTP_COOLDOWN_SECONDS);
    handleRequestOtp();
  };

  return (
    <div className="flex flex-col items-center">
      <Typography.Title className="!text-[20px]">Enter OTP</Typography.Title>
      <Typography.Text type="secondary" className="!mb-[24px]">
        OTP sent to <span className="text-black">{props.userEmail}.</span>{" "}
        <Button
          type="link"
          onClick={props.showLogin}
          size="small"
          className="!p-0"
        >
          Not you?
        </Button>
      </Typography.Text>
      <Form
        onFinish={handleVerifyOtp}
        layout="vertical"
        requiredMark={false}
        className="w-full"
      >
        <Form.Item
          label="OTP"
          rules={[{ required: true, message: "Please enter the OTP." }]}
          extra={
            <div className="flex justify-end mt-[10px]">
              {canResendOtp ? (
                <Button type="link" onClick={handleResendOtp} size="small">
                  Resend OTP
                </Button>
              ) : (
                <span>
                  Resend OTP in{" "}
                  <span className="!text-black">
                    {parseOtpTime(otpTimeRemaining)}
                  </span>
                </span>
              )}
            </div>
          }
        >
          <Input onChange={handleOtpChange} placeholder="Enter OTP" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={verifyingOtp}
          disabled={verifyingOtp}
        >
          Login
        </Button>
      </Form>
    </div>
  );
};

export default VerifyOtp;
