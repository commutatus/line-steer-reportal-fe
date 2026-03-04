import React from "react";
import { Result, Button } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import RootLayout from "@/common/layouts/root-layout";
import { useGlobals } from "@/common/context/globals";
import { UserType } from "@/common/hooks/useCurrentUser";

type ComingSoonPageProps = {
  pageTitle?: string;
};

const getBackButtonDetails = (userType: UserType) => {
  let result = {
    label: "Planning",
    pathname: "/consumer"
  }

  if (userType === UserType.GENERATOR) {
    result = {
      label: "Requests",
      pathname: "/generator",
    }
  }

  return result;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ pageTitle }) => {
  const router = useRouter();
  const { currentUser } = useGlobals();

  const { label, pathname } = getBackButtonDetails(currentUser?.userType ?? UserType.CONSUMER)

  return (
    <RootLayout pageTitle={pageTitle}>
      <div className="flex items-center justify-center p-6 h-full">
        <Result
          icon={<ClockCircleOutlined style={{ color: "#faad14" }} />}
          title="This feature is coming soon"
          subTitle="We're working hard to bring this to you. Stay tuned!"
          extra={
            <Button type="primary" onClick={() => router.push(pathname)}>
              Back to {label}
            </Button>
          }
        />
      </div>
    </RootLayout>
  );
};

export default ComingSoonPage;
