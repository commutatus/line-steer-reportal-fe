import { CurrentUserQuery, CurrentUserQueryVariables } from "@/generated/graphql";
import { gql, useQuery } from "@apollo/client";
import { AuthStatesEnum } from "../context/globals";

export enum UserType {
  CONSUMER = "CONSUMER",
  GENERATOR = "GENERATOR",
}

const GET_CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      email
      firstName
      fullName
      id
      lastName
      consumer {
        createdAt
        id
        name
      }
      generator {
        createdAt
        id
        name
      }
    }
  }
`;

type useCurrentUserProps = {
  authState: AuthStatesEnum;
};

const useCurrentUser = (props: useCurrentUserProps) => {
  const { authState } = props;
  const { data, ...rest } = useQuery<
    CurrentUserQuery,
    CurrentUserQueryVariables
  >(GET_CURRENT_USER, {
    skip: authState !== AuthStatesEnum.loggedIn,
    fetchPolicy: "cache-and-network",
  });

  const currentUser = data?.currentUser;

  if (authState === AuthStatesEnum.loggedOut) {
    return null;
  }

  const userType = currentUser?.generator?.id 
    ? UserType.GENERATOR 
    : currentUser?.consumer?.id 
    ? UserType.CONSUMER 
    : null;

  return {
    data: currentUser,
    userType,
    ...rest,
  };
}

export default useCurrentUser;
