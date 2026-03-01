import { useGlobals } from "@/common/context/globals";
import {
  RequestOtpMutation,
  RequestOtpMutationVariables,
} from "@/generated/graphql";
import { useMutation } from "@apollo/client";
import { Button, Form, Input, Typography } from "antd";
import Image from "next/image";

type LoginProps = {
  userEmail?: string;
  setUserEmail?: (email: string) => void;
  showVerifyOtp?: () => void;
  requestOtp?: ReturnType<
    typeof useMutation<RequestOtpMutation, RequestOtpMutationVariables>
  >[0];
  isRequestingOtp?: boolean;
};

const Login = (props: LoginProps) => {
  const { userEmail, setUserEmail, isRequestingOtp } = props;
  const { notificationApi } = useGlobals();

  const handleLogin = () => {
    if (!userEmail) {
      return;
    }
    props
      .requestOtp?.({
        variables: {
          input: {
            email: userEmail,
          },
        },
      })
      .then(() => {
        props.showVerifyOtp?.();
      })
      .catch((error) => {
        notificationApi?.error({
          message: "Error",
          description: error.message,
        });
      });
  };

  return (
    <div className="flex flex-col items-center">
      <Image
        src="/assets/images/line-steer-logo.png"
        alt="Line Steer logo"
        width={132}
        height={56}
      />
      <Typography.Text className="!mt-[16px] !mb-[24px]">
        You can sign up or login with your email
      </Typography.Text>
      <Form
        onFinish={handleLogin}
        requiredMark={false}
        initialValues={{
          email: userEmail,
        }}
        layout="vertical"
        className="w-full"
      >
        <Form.Item name="email" label="Email">
          <Input
            placeholder="Enter your email"
            value={userEmail}
            onChange={(e) => setUserEmail?.(e.target.value)}
            type="email"
            required
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isRequestingOtp}
            loading={isRequestingOtp}
            block
          >
            Continue
          </Button>
          <div className="text-center mt-[8px]">
            <Typography.Text type="secondary">
              By continuing, you agree to our {/* TODO: add link */}
              <a
                href="#"
                target="_blank"
                className="!text-black !hover:text-black !underline"
              >
                terms & conditions
              </a>
            </Typography.Text>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
