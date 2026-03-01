import { gql } from "@apollo/client";

export const REQUEST_OTP = gql`
  mutation RequestOtp($input: RequestOtpInput!) {
    requestOtp(input: $input)
  }
`;

export const VERIFY_OTP = gql`
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
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
