import { CurrentUserQuery, CurrentUserQueryVariables } from "@/generated/graphql";
import { gql, useQuery } from "@apollo/client";
import { AuthStatesEnum } from "../context/globals";

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

  return {
    data: currentUser,
    ...rest,
  };
}

export default useCurrentUser;
