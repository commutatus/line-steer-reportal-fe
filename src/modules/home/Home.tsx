import PageLoader from "@/common/components-ui/page-loader/page-loader";
import RootLayout from "@/common/layouts/root-layout";

const Home = () => {

  return (
    <RootLayout pageTitle="Loading" shouldShowSidebar={false}>
      <PageLoader />
    </RootLayout>
  );
};

export default Home;
