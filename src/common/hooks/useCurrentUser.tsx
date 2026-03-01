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
    }
  }
`;

type useCurrentUserProps = {
  authState: AuthStatesEnum;
};
// TODO: Remove this
const useCurrentUser = (props: useCurrentUserProps) => {
  const { authState } = props;
  const { ...rest } = useQuery<
    CurrentUserQuery,
    CurrentUserQueryVariables
  >(GET_CURRENT_USER, {
    skip: true, // TODO: Remove this
    fetchPolicy: "cache-and-network",
  });

  // const currentUser = data?.currentUser;

  if (authState === AuthStatesEnum.loggedOut) {
    return null;
  }

  return {
    ...rest,
    data: {
      email: "amal",
      firstName: "Amal",
      fullName: "Amal",
      id: "1",
      lastName: "Amal",
    },
  };
}

export default useCurrentUser;
