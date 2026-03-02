import { gql } from "@apollo/client";

export const GET_CONTRACTS = gql`
  query GetContracts {
    contracts {
      data {
        createdAt
        id
        park {
          id
          name
          city
        }
      }
    }
  }
`;
