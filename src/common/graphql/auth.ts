import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($loginInput: LoginInput!) {
    login(input: $loginInput) {
      accessToken
      refreshToken
    }
  }
`;

export const SIGNUP = gql`
  mutation SignUp($userInput: SignUpInput!) {
    signUp(input: $userInput) {
      accessToken
      refreshToken
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshAccessToken($refreshTokenInput: RefreshAccessTokenInput!) {
    refreshAccessToken(input: $refreshTokenInput) {
      accessToken
      refreshToken
    }
  }
`;
