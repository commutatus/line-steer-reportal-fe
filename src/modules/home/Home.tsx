import PageLoader from "@/common/components-ui/page-loader/page-loader";
import { useGlobals } from "@/common/context/globals";
import RootLayout from "@/common/layouts/root-layout";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home = () => {
  const { currentUser } = useGlobals();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser?.data) {
      return;
    }
    if (currentUser?.data?.consumer) {
      router.push("/consumer");
    } else if (currentUser?.data?.generator) {
      router.push("/generator");
    }
  }, [currentUser]);

  return (
    <RootLayout pageTitle="Loading" shouldShowSidebar={false}>
      <PageLoader />
    </RootLayout>
  );
};

export default Home;
