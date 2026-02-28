export type RefreshAccessTokenMutation = {
  __typename?: "Mutation";
  refreshAccessToken?: {
    __typename?: "Token";
    accessToken: string;
    refreshToken?: string | null;
  } | null;
};

export type RefreshAccessTokenMutationVariables = Exact<{
  refreshTokenInput: RefreshAccessTokenInput;
}>;

export type RefreshAccessTokenInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  refreshToken: Scalars["String"]["input"];
};

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;

export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  ISO8601DateTime: { input: any; output: any };
};