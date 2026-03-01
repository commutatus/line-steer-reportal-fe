import { gql } from "@apollo/client";

export const GET_PARKS = gql`
  query GetParks {
    contracts {
      data {
        createdAt
        id
        park {
          id
          name
        }
      }
    }
  }
`;
