import { gql } from "@apollo/client";

export const GET_LOAD_SCHEDULED_DAYS = gql`
  query GetLoadScheduleDays($filters: LoadScheduleDayFilterInput) {
    loadScheduleDays(filters: $filters) {
      data {
        createdAt
        date
        id
        updatedAt
        status
        loadSchedules {
          id
          startTime
          endTime
          load
          createdAt
          updatedAt
        }
      }
    }
  }
`;
