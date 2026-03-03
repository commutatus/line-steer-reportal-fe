import Navbar from "@/common/components/navbar";
import Sidebar from "@/common/components/sidebar/sidebar";
import { getPageTitle } from "@/common/utils/getPageTitle";
import { Layout } from "antd";
import classNames from "classnames";
import Head from "next/head";

const { Content } = Layout;
type Props = {
  children?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  navbarExtra?: React.ReactNode;
  shouldShowNavbar?: boolean;
  shouldShowSidebar?: boolean;
};

const RootLayout: React.FC<Props> = ({
  children,
  pageTitle,
  pageDescription,
  navbarExtra,
  shouldShowNavbar = true,
  shouldShowSidebar = true,
}) => {
  return (
    <Layout
      className={classNames("!min-h-[100dvh] !bg-white")}
      hasSider={shouldShowSidebar}
    >
      <Head>
        <title>{getPageTitle(pageTitle ?? "Social Beat")}</title>
        {pageDescription && <meta name="description" content={pageDescription} />}
      </Head>
      {shouldShowSidebar && <Sidebar />}
      <Layout>
        {shouldShowNavbar && <Navbar pageTitle={pageTitle} pageDescription={pageDescription} navbarExtra={navbarExtra} />}
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default RootLayout;
