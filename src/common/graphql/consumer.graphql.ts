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

export const DAY_WISE_PLAN_QUERY = gql`
  query GetDayWisePlanQuery($filters: LoadScheduleDayFilterInput) {
    loadScheduleDays (filters: $filters) {
        data {
          createdAt
          date
          id
          status
          totalLoad
          updatedAt
          park {
            id
            name
          }
      }
    }
  }
`;

export const OVERALL_PLAN_QUERY = gql`
  query GetOverallPlan($filters: LoadScheduleDayFilterInput) {
    dailyLoadSummary (filters: $filters){
      data {
        date
        totalLoad
        parkLoads {
          totalLoad
          park {
            id
            name
          }
        }
      }
    }
  }
`;
