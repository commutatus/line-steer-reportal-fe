import "@/common/styles/globals.css";
import type { AppProps } from "next/app";
import { GlobalsProvider } from "@/common/context/globals/globals-provider";
import { ConfigProvider } from "antd";
import antdGlobalTheme from "@/common/styles/antdThemeConfig";
import ApolloClientProvider from "@/apollo/apollo-client-provider";
import AuthGuard from "@/common/components/auth-guard";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider theme={antdGlobalTheme}>
      <ApolloClientProvider {...pageProps}>
        <GlobalsProvider>
          <AuthGuard>
            <Component {...pageProps} />
          </AuthGuard>
        </GlobalsProvider>
      </ApolloClientProvider>
    </ConfigProvider>
  );
}
