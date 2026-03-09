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
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const { Text, Title } = Typography;

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

interface OTPFormValues {
  otp: string;
}

const VerifyOtp = (props: VerifyOtpProps) => {
  const [form] = Form.useForm<OTPFormValues>();
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

  const otpValue = Form.useWatch("otp", form);

  const isOtpComplete = otpValue?.length === 6;

  const handleVerifyOtp = (values: OTPFormValues) => {
    const otpToVerify = values.otp;
    if (!otpToVerify || !props.userEmail) {
      return;
    }

    const variables: VerifyOtpMutationVariables = {
      input: {
        email: props.userEmail,
        otp: otpToVerify,
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
        notificationApi?.success({
          message: "Login successful",
        });
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
    <Form
      className="flex flex-col items-center gap-2"
      onFinish={handleVerifyOtp}
      form={form}
    >
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={props.showLogin}
        className="!text-gray-500 hover:!text-gray-700 mb-4 mr-auto"
        size="small"
      >
        Back
      </Button>
      <div className="text-center mb-2">
        <Title level={4} className="text-center">
          Enter verification code
        </Title>
        <Text className="text-gray-500">
          We sent a code to <strong>{props.userEmail}</strong>
        </Text>
      </div>
      <Form.Item
        name="otp"
        rules={[
          {
            required: true,
            message: "Please enter the OTP",
          },
        ]}
      >
        <Input.OTP
          length={6}
          disabled={verifyingOtp}
          size="large"
          inputMode="numeric"
          onInput={(val) => form.setFieldsValue({ otp: val.join("") })} // Default onChange isn't working for OtpInput
        />
      </Form.Item>
      <Button
        type="primary"
        loading={verifyingOtp}
        disabled={!isOtpComplete}
        size="large"
        block
        htmlType="submit"
      >
        Submit OTP
      </Button>
      <div className="flex justify-center mt-2">
        {canResendOtp ? (
          <Button type="link" onClick={handleResendOtp} size="small">
            Resend OTP
          </Button>
        ) : (
          <Text type="secondary">
            Resend OTP in{" "}
            <span className="text-black">
              {parseOtpTime(otpTimeRemaining)}
            </span>
          </Text>
        )}
      </div>
    </Form>
  );
};

export default VerifyOtp;
