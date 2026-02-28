"use client";

import { ApolloProvider } from "@apollo/client";
import { useApollo } from "./apollo-client";

const ApolloClientProvider = ({
  children,
  ...props
}: {
  children: React.ReactNode;
}) => {
  const client = useApollo(props);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloClientProvider;
