"use client";

import { ApolloClient } from "@apollo/client";
import { useRef } from "react";
import { initializeApollo } from "./initialize-apollo";
import { APOLLO_STATE_PROP_NAME } from "./apollo.constants";

type useApolloProps = Partial<{
  [APOLLO_STATE_PROP_NAME]?: object;
}>;

export function useApollo(pageProps: useApolloProps) {
  const state = pageProps?.[APOLLO_STATE_PROP_NAME];
  const apolloClientRef = useRef<ApolloClient<object>>(initializeApollo(state));

  if (!apolloClientRef.current) {
    apolloClientRef.current = initializeApollo(state);
  }

  return apolloClientRef.current;
}
